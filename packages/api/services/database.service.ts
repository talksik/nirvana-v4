// External Dependencies
import * as mongoDB from "mongodb";

import { loadConfig } from "../config";

// Global Variables
export const collections: {
  users?: mongoDB.Collection;
  lines?: mongoDB.Collection;
  lineMembers?: mongoDB.Collection;
} = {};

// Initialize Connection
const config = loadConfig();

export const client: mongoDB.MongoClient = new mongoDB.MongoClient(
  config.MONGO_CONNECTION_STRING
);

client.connect();

const db: mongoDB.Db = client.db(process.env.DB_NAME);

const usersCollection: mongoDB.Collection = db.collection("users");
const lineCollection: mongoDB.Collection = db.collection("lines");
const lineMembersCollection: mongoDB.Collection = db.collection("lineMembers");

collections.users = usersCollection;
collections.lines = lineCollection;
collections.lineMembers = lineMembersCollection;

console.log(
  `Successfully connected to database: ${db.databaseName} and collections`
);
