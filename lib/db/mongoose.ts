import "server-only";

import mongoose from "mongoose";

const DATABASE_NAME = "ai-support-agent";

type MongooseCache = {
  connection?: typeof mongoose;
  connectPromise?: Promise<typeof mongoose>;
};

const globalForMongoose = globalThis as typeof globalThis & {
  __mongoose?: MongooseCache;
};

function getMongoUri() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI. Add it to .env.local (see .env.example).",
    );
  }

  return uri;
}

export async function connectMongo() {
  const cache = (globalForMongoose.__mongoose ??= {});

  if (cache.connection) {
    return cache.connection;
  }

  if (!cache.connectPromise) {
    cache.connectPromise = mongoose.connect(getMongoUri(), {
      dbName: DATABASE_NAME,
      bufferCommands: false,
    });
  }

  cache.connection = await cache.connectPromise;
  return cache.connection;
}

export async function pingMongo() {
  const connection = await connectMongo();
  const db = connection.connection.db;

  if (!db) {
    throw new Error("MongoDB is not connected.");
  }

  await db.admin().command({ ping: 1 });
}
