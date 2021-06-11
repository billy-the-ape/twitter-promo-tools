import { Campaign } from '@/types';
import { FilterQuery, ObjectId } from 'mongodb';

import { getCollection } from './util';

export const upsertCampaign = async (userId: string, campaign: Campaign) => {
  const collection = await getCollection('campaigns');

  const {
    // Remove fields that are set on insert
    _id,
    dateAdded: _,
    creator: _0,
    permissions: _1,
    ...updateData
  } = campaign;

  const { upsertedId } = await collection.updateOne(
    {
      _id: new ObjectId(campaign._id!),
    },
    {
      $set: updateData,
      $setOnInsert: { dateAdded: new Date(), creator: userId },
    },
    {
      upsert: true,
    }
  );

  return upsertedId;
};

export const deleteCampaigns = async (userId: string, ids: ObjectId[]) => {
  const campaigns = await getCampaigns(userId, { _id: { $in: ids } });
  const userOwnsAll = !campaigns.filter(({ creator }) => creator !== userId)
    .length;
  if (!userOwnsAll) {
    return false;
  }
  const collection = await getCollection('campaigns');
  await collection.deleteMany({ _id: { $in: ids } });
  return true;
};

export const getCampaigns = async (
  userId: string,
  query: FilterQuery<Campaign>
): Promise<Campaign[]> => {
  const collection = await getCollection('campaigns');
  const result = await collection
    .aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'managers.id',
          foreignField: 'id',
          as: 'u1',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: 'id',
          as: 'u2',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'influencers.id',
          foreignField: 'id',
          as: 'u3',
        },
      },
      {
        $addFields: {
          users: {
            $setDifference: [
              {
                $concatArrays: ['$u1', '$u2', '$u3'],
              },
              [],
            ],
          },
        },
      },
      {
        $unset: ['u1', 'u2', 'u3'],
      },
    ])
    .toArray();

  console.log(result[4]?.users);

  return result.map((campaign) => ({
    ...campaign,
    permissions: {
      canEdit:
        campaign.creator === userId ||
        !!campaign.managers?.find(({ id }) => id === userId),
      canDelete: campaign.creator === userId,
    },
  }));
};

export const getCampaignsForUser = async (
  userId: string
): Promise<Campaign[]> => {
  return await getCampaigns(userId, {
    $or: [
      { creator: userId },
      { managers: { $elemMatch: { id: userId } } },
      { influencers: { $elemMatch: { id: userId } } },
    ],
  });
};
