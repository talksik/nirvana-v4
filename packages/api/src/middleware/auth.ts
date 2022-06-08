import { NextFunction, Request, Response } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import jwt, { JwtPayload } from 'jsonwebtoken';

import environmentVariables from '../config/config';

// used by specific routes that need to authentication
export const authCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw Error('No provided header');
    }

    // verify jwt token with our api secret
    const decoded: string | JwtPayload = jwt.verify(
      authorization,
      environmentVariables.JWT_TOKEN_SECRET,
    );

    res.locals.userInfo = decoded as JwtClaims;

    next();
  } catch (error) {
    res.status(401).send('unauthorized');
  }
};

export interface JwtClaims {
  userId: string;
  googleUserId: string;
  picture: string;
  email: string;
  name: string;
}
