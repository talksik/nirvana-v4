import dotenv from "dotenv";

if (process.env && process.env.NODE_ENV === "development") {
  dotenv.config({ path: ".env.development" });
} else {
  dotenv.config({ path: ".env" });
}

export const loadConfig = () => {
  return {
    MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING!,
    JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET!,
    GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID!,
    GOOGLE_AUTH_CLIENT_SECRET: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
  };
};
