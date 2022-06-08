import { GoogleUserInfo, User } from '@nirvana/core/models';
import { JwtClaims, authCheck } from '../middleware/auth';
import express, { Application, Request, Response } from 'express';

import LoginResponse from '../../core/responses/login.response';
import { OAuth2Client } from 'google-auth-library';
import { ObjectID } from 'bson';
import { ObjectId } from 'mongodb';
import UserDetailsResponse from '../../core/responses/userDetails.response';
import { UserService } from '../services/user.service';
import { UserStatus } from '../../core/models/user.model';
import { collections } from '../services/database.service';
import { loadConfig } from '../config';

const jwt = require('jsonwebtoken');

const config = loadConfig();

const client = new OAuth2Client(config.GOOGLE_AUTH_CLIENT_ID);

export default function getUserRoutes() {
  const router = express.Router();

  router.use(express.json());

  // get user details based on id token
  router.get('/', authCheck, getUserDetails);

  router.get('/login', login);

  router.get('/authcheck', authCheck, handleAuthCheck);

  return router;
}

async function handleAuthCheck(req: Request, res: Response) {
  try {
    res.status(200).json('You are good to go!');
  } catch (error) {
    res.status(401).json('Unauthorized');
  }
}

async function getUserDetails(req: Request, res: Response) {
  try {
    const userInfo = res.locals.userInfo as JwtClaims;

    const user = await UserService.getUserById(userInfo.userId);

    user
      ? res.status(200).json(new UserDetailsResponse(user))
      : res.status(404).json('No such user');
  } catch (error) {
    console.log(error);
    res.status(500).json(`Problem with signing user up or logging in`);
  }
}

/** Create user if doesn't exist
 *  Returns jwt token for client and user details
 */
async function login(req: Request, res: Response) {
  // passed in accesstoken no matter what
  const { access_token, id_token } = req.query;

  try {
    const ticket = await client.verifyIdToken({
      idToken: (id_token as string) ?? '',
      audience: config.GOOGLE_AUTH_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const googleUserId = ticket.getPayload()?.sub as string;
    const email = ticket.getPayload()?.email as string;

    if (!googleUserId || !email) {
      res.status(401).json('no google account found');
      return;
    }

    // return user details if it passed auth middleware
    let user = await UserService.getUserByEmail(email);

    // if no user found, then go ahead and create user
    if (!user) {
      if (!access_token) {
        res.status(400).json('No access token provided');
        return;
      }

      // get google user info from access token
      const userInfo: GoogleUserInfo = await UserService.getGoogleUserInfoWithAccessToken(
        access_token as string,
      );

      // create initial user model object

      const newUser = new User(
        googleUserId,
        userInfo.email,
        userInfo.name,
        userInfo.given_name,
        userInfo.family_name,
        new Date(),
        userInfo.picture,
        userInfo.verifiedEmail,
        userInfo.locale,
      );

      // create user if not exists
      const insertResult = await UserService.createUserIfNotExists(newUser);

      newUser._id = insertResult?.insertedId;

      // create jwt token with new user info
      const jwtToken = jwt.sign(
        {
          userId: newUser._id,
          googleUserId: newUser.googleId,
          picture: newUser.picture,
          email: newUser.email,
          name: newUser.name,
        },
        config.JWT_TOKEN_SECRET,
      );

      insertResult
        ? res.status(200).json(new LoginResponse(jwtToken, newUser))
        : res.status(500).json('Failed to create account, already exists');

      return;
    }

    // create jwt token with existing user info
    const existingUserJwtToken = jwt.sign(
      {
        userId: user._id,
        googleUserId: user.googleId,
        picture: user.picture,
        email: user.email,
        name: user.name,
      },
      config.JWT_TOKEN_SECRET,
    );

    res.status(200).json(new LoginResponse(existingUserJwtToken, user));
  } catch (error) {
    console.log(error);
    res.status(500).json(`Problem with signing user up or logging in`);
  }
}
