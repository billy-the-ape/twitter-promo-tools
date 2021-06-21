import { Campaign, CampaignPermissions, CollectionTypeMap } from '@/types';
import { Db, MongoClient } from 'mongodb';
import { Collection } from 'mongodb';

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
// Create cached connection variable
let cachedClient: MongoClient;
let cachedDb: Db | null;
let cacheCreationTime = 0;
// Close connection every 5 minutes
const CACHE_LIMIT = 60000 * 5;

export const connectToDatabase = async (): Promise<Db> => {
  const uri = process.env.MONGODB_URI!;
  // If the database connection is cached,
  // use it instead of creating a new connection
  const now = Date.now();

  if (cachedClient && cacheCreationTime < now - CACHE_LIMIT) {
    console.log('CLOSING CONNECTION');
    cachedClient.close();
    cachedDb = null;
  } else if (cachedDb) {
    console.log('USING CACHED DB');
    return cachedDb;
  }

  cacheCreationTime = now;

  // If no connection is cached, create a new one
  cachedClient = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // Select the database through the connection,
  // using the database path of the connection string
  const dbName = new URL(uri).pathname.substr(1);
  const db = cachedClient.db(dbName);

  // Cache the database connection and return the connection
  cachedDb = db;
  return db;
};

export const getCollection = async <TKey extends keyof CollectionTypeMap>(
  key: TKey
) => {
  const db = await connectToDatabase();
  return db.collection(key) as Collection<CollectionTypeMap[TKey]>;
};
