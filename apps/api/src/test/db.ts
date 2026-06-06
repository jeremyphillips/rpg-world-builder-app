import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { connectDb, disconnectDb } from "../lib/db";
import { resetEnv } from "../env";

let mongod: MongoMemoryServer | undefined;

/** Boot an in-memory MongoDB and point a fresh test env at it. */
export async function startTestDb(): Promise<void> {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-secret-test-secret-1234567890";
  resetEnv();

  mongod = await MongoMemoryServer.create();
  await connectDb(mongod.getUri());
}

export async function stopTestDb(): Promise<void> {
  await disconnectDb();
  await mongod?.stop();
  mongod = undefined;
}

/** Remove all documents between tests so each case starts clean. */
export async function clearTestDb(): Promise<void> {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}
