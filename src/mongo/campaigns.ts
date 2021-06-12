import { Campaign, SubmittedTweet } from '@/types';
import { FilterQuery, ObjectId } from 'mongodb';

import { getCollection, getUserCampaignPermissions } from './util';

export const upsertCampaign = async (userId: string, campaign: Campaign) => {
  const { canEdit } = getUserCampaignPermissions(userId, campaign);

  const {
    // Remove fields that are set on insert or aggregations
    _id,
    dateAdded: _,
    creator: _0,
    permissions: _1,
    users: _2,
    ...updateData
  } = campaign;

  // Deny user without edit rights on existing campaigns
  if (!canEdit && _id) {
    return false;
  }

  const collection = await getCollection('campaigns');

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

  return upsertedId || _id;
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

  return result.map((campaign) => ({
    ...campaign,
    permissions: getUserCampaignPermissions(userId, campaign),
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

export const addTweetToCampaign = async (
  id: string,
  campaign: Campaign,
  authorId: string,
  userId: string,
  createdAt: Date
) => {
  const { _id, submittedTweets = [] } = campaign;

  const { canTweet, canEdit } = campaign.permissions || {};

  // User isn't a manager or influencer on the campaign
  if (!canTweet && !canEdit) {
    return 403;
  }

  const collection = await getCollection('campaigns');
  const tweetCollection = await getCollection('tweets');

  const existingTweet = await tweetCollection.findOne({ id });

  // Tweet is already submitted and not a manager
  if (existingTweet !== null && !canEdit) {
    return 409;
  }

  // Semi rare case where manager or owner submits a user's tweet
  // make sure the author is an influencer on the project
  if (
    userId !== authorId &&
    !campaign.influencers?.some(({ id }) => id === authorId)
  ) {
    return 418; // I'm a teapot
  }

  const newTweet: SubmittedTweet = {
    id,
    authorId,
    createdAt,
  };

  tweetCollection.insertOne(newTweet);
  submittedTweets.push(newTweet);

  await collection.updateOne({ _id }, { $set: { submittedTweets } });

  return 204;
};
