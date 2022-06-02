import { NextFunction, Request, Response } from "express";

import { loadConfig } from "../config";

const jwt = require("jsonwebtoken");

const config = loadConfig();

// used by specific routes that need to authentication
export const authCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw Error("No provided header");
    }

    // verify jwt token with our api secret
    var decoded: JwtClaims = jwt.verify(authorization, config.JWT_TOKEN_SECRET);

    res.locals.userInfo = decoded;

    next();
  } catch (error) {
    res.status(401).send("unauthorized");
  }
};

export interface JwtClaims {
  userId: string;
  googleUserId: string;
  picture: string;
  email: string;
  name: string;
}
