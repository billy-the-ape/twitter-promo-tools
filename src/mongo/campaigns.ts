import { ObjectId } from 'mongodb';
import { getCollection } from './util';
import { Campaign } from '@/types';

export const upsertCampaign = async (userId: string, campaign: Campaign) => {
  const collection = await getCollection("campaigns");

  const { upsertedId } = await collection.updateOne({
    _id: campaign._id || new ObjectId(),
  }, {
    $set: campaign,
    $setOnInsert: { dateAdded: new Date(), creator: userId },
  }, {
    upsert: true,
  });

  return upsertedId;
}

export const getCampaigns = async (userId: string): Promise<Campaign[]> => {
  const collection = await getCollection("campaigns");

  return await collection.find({ $or: [{ creator: userId }, { managers: userId }, { influencers: userId }] }).toArray();
};