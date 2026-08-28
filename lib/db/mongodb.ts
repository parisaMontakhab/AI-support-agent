import "server-only";

import { MongoClient } from "mongodb";

type MongoCache = {
  client?: MongoClient;
  connectPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as typeof globalThis & {
  __mongo?: MongoCache;
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

export async function getMongoClient() {
  const cache = (globalForMongo.__mongo ??= {});

  if (cache.client) {
    return cache.client;
  }

  if (!cache.connectPromise) {
    const client = new MongoClient(getMongoUri());
    cache.connectPromise = client.connect().then((connected) => {
      cache.client = connected;
      return connected;
    });
  }

  return cache.connectPromise;
}

const DATABASE_NAME = "ai-support-agent";

export async function pingMongo() {
  const client = await getMongoClient();
  await client.db("admin").command({ ping: 1 });
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db(DATABASE_NAME);
}
