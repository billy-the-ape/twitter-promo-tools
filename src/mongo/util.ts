import { Campaign, CampaignPermissions, CollectionTypeMap } from '@/types';
import { Collection, Db, MongoClient } from 'mongodb';

type ConnType = {
  client: MongoClient;
  db: Db;
};

type CachedType = {
  conn: ConnType | null;
  promise: Promise<ConnType> | null;
};

const MONGODB_URI = process.env.MONGODB_URI;

export const getUserCampaignPermissions = (
  userId: string,
  campaign: Campaign
): CampaignPermissions => {
  const owner = campaign.creator === userId;
  const manager =
    owner || campaign.managers?.some(({ id }) => id === userId) || false;
  const influencer =
    (owner ||
      manager ||
      campaign.influencers?.some(({ id }) => id === userId)) ??
    false;

  return {
    owner,
    manager,
    influencer,
  };
};

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongo as CachedType;

if (!cached) {
  cached = (global as any).mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxIdleTimeMS: 10000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    };
    const dbName = new URL(process.env.MONGODB_URI!).pathname.substr(1);
    cached.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
      return {
        client,
        db: client.db(dbName),
      };
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export const getCollection = async <TKey extends keyof CollectionTypeMap>(
  key: TKey
) => {
  const db = (await connectToDatabase()).db;
  return db.collection(key) as Collection<CollectionTypeMap[TKey]>;
};
