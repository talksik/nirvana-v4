import { GoogleUserInfo, User } from "@nirvana/core/models";

import { ObjectId } from "mongodb";
import { UserStatus } from "../../core/models/user.model";
import axios from "axios";
import { collections } from "./database.service";

export class UserService {
  static async getUserById(userId: string) {
    const query = { _id: new ObjectId(userId) };

    const res = await collections.users?.findOne(query);

    // exists
    if (res?._id) {
      return res as User;
    }

    return null;
  }

  static async getUsersByIds(userIds: ObjectId[]) {
    const query = { _id: { $in: userIds } };

    const res = await collections.users?.find(query).toArray();

    // exists
    if (res?.length) {
      return res as User[];
    }

    return undefined;
  }

  static async getUserByGoogleId(googleUserId: string) {
    const query = { googleId: googleUserId };

    const res = await collections.users?.findOne(query);

    // exists
    if (res?._id) {
      return res as User;
    }

    return null;
  }

  static async getUserByEmail(email: string) {
    const query = { email };

    const res = await collections.users?.findOne(query);

    // exists
    if (res?._id) {
      return res as User;
    }

    return null;
  }

  static async getUsersLikeEmailAndName(searchQuery: string) {
    // based on index defined in Mongo atlas
    const query = {
      $search: {
        index: "basic user search",
        text: {
          query: searchQuery,
          path: {
            wildcard: "*",
          },
        },
      },
    };

    // const res = await collections.users?.find(query).toArray();

    const res = await collections.users?.aggregate([query]).toArray();

    // exists
    if (res?.length) {
      return res as User[];
    }

    return null;
  }

  static async createUserIfNotExists(newUser: User) {
    const getUser = await this.getUserByEmail(newUser.email);

    if (!getUser) {
      return await collections.users?.insertOne(newUser);
    }

    // user with email exists already, don't create
    return null;
  }

  static async getGoogleUserInfoWithAccessToken(
    accessToken: string
  ): Promise<GoogleUserInfo> {
    return (
      await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
      )
    ).data;
  }

  static async updateUserStatus(userGoogleId: string, newStatus: UserStatus) {
    const query = { googleId: userGoogleId };
    const updateDoc = {
      $set: { status: newStatus, lastUpdatedDate: new Date() },
    };

    const resultUpdate = await collections.users?.updateOne(query, updateDoc);

    return resultUpdate;
  }
}
