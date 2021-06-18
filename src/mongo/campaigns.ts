import { Campaign, SubmittedTweet } from '@/types';
import { FilterQuery, ObjectId } from 'mongodb';

import type { CampaignAggregationOption } from './campaignAggregations';
import { completionPercentage, fullUsers } from './campaignAggregations';
import { ValidSort, sortMap } from './campaignSorts';
import { getCollection, getUserCampaignPermissions } from './util';

export const upsertCampaign = async (userId: string, campaign: Campaign) => {
  const { manager } = getUserCampaignPermissions(userId, campaign);

  const {
    // Remove fields that are set on insert or aggregations
    _id,
    dateAdded: _,
    creator: _0,
    permissions: _1,
    users: _2,
    submittedTweets: _3, // These should be updated only with `addTweetToCampaign`
    startDate,
    endDate,
    ...updateData
  } = campaign;

  // Deny user without edit rights on existing campaigns
  if (!manager && _id) {
    return false;
  }

  const collection = await getCollection('campaigns');

  let realStartDate = startDate;
  let realEndDate = endDate;

  if (['string', 'number'].includes(typeof startDate)) {
    realStartDate = new Date(startDate as any);
  }
  if (['string', 'number'].includes(typeof endDate)) {
    realEndDate = new Date(endDate as any);
  }

  const { upsertedId } = await collection.updateOne(
    {
      _id: new ObjectId(campaign._id!),
    },
    {
      $set: {
        ...updateData,
        startDate: realStartDate,
        endDate: realEndDate,
      },
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
  query: FilterQuery<Campaign>,
  searchText: string = '',
  aggregationOptions: Partial<Record<CampaignAggregationOption, boolean>> = {},
  sort?: keyof typeof sortMap,
  pageNum = 0,
  pageSize = 10
): Promise<Campaign[]> => {
  const collection = await getCollection('campaigns');

  const agg: object[] = [
    {
      $match: query,
    },
    {
      $addFields: {
        userTweets: {
          $filter: {
            input: '$submittedTweets',
            as: 'tweet',
            cond: { $eq: ['$$tweet.authorId', userId] },
          },
        },
      },
    },
    {
      $addFields: {
        userTweets: {
          $filter: {
            input: '$submittedTweets',
            as: 'tweet',
            cond: { $eq: ['$$tweet.authorId', userId] },
          },
        },
      },
    },
  ];

  if (searchText?.trim() ?? '' !== '') {
    agg.unshift({
      $search: {
        index: 'campaignSearch',
        text: {
          query: searchText.trim(),
          path: {
            wildcard: '*',
          },
        },
      },
    });
  }

  if (aggregationOptions.completionPercentage) {
    agg.push(...completionPercentage);
  }

  if (sort) {
    agg.push(sortMap[sort]);
  }

  // PAGINATION
  agg.push(
    ...[
      {
        $skip: pageNum * pageSize,
      },
      {
        $limit: pageSize,
      },
    ]
  );

  if (aggregationOptions.fullUsers) {
    agg.push(...fullUsers);
  }

  const result = await collection
    .aggregate(agg, {
      // TODO: possibly pass user locale
      collation: { locale: 'en', caseFirst: 'lower' },
    })
    .toArray();

  return result.map((campaign) => {
    const permissions = getUserCampaignPermissions(userId, campaign);
    let { submittedTweets, userTweets } = campaign;

    // Managers can see all tweets
    if (!permissions.manager) {
      submittedTweets = userTweets;
    }
    userTweets?.sort(
      ({ createdAt: createdAtA }, { createdAt: createdAtB }) =>
        createdAtB.valueOf() - createdAtA.valueOf()
    );
    if (userTweets?.length === 2) {
      console.log({ userTweets });
    }
    submittedTweets?.sort(
      ({ createdAt: createdAtA }, { createdAt: createdAtB }) =>
        createdAtB.valueOf() - createdAtA.valueOf()
    );

    return {
      ...campaign,
      submittedTweets,
      userTweets,
      permissions,
    };
  });
};

export const getCampaignsForUser = async (
  userId: string,
  searchText?: string,
  aggregationOptions: Partial<Record<CampaignAggregationOption, boolean>> = {},
  sort?: ValidSort,
  pageNum = 0,
  pageSize = 10
): Promise<Campaign[]> => {
  return await getCampaigns(
    userId,
    {
      $or: [
        { creator: userId },
        { managers: { $elemMatch: { id: userId } } },
        { influencers: { $elemMatch: { id: userId } } },
      ],
    },
    searchText,
    aggregationOptions,
    sort,
    pageNum,
    pageSize
  );
};

export const deleteTweet = async (
  userId: string,
  tweetId: string,
  campaign: Campaign
) => {
  const { _id, submittedTweets, permissions: { manager } = {} } = campaign;

  const tweetCollection = await getCollection('tweets');
  const tweet = await tweetCollection.findOne({ id: tweetId });

  if (!tweet) {
    return 404;
  }

  // Managers can delete everyone's tweets
  if (!manager && userId !== tweet.authorId) {
    return 403;
  }

  if (!submittedTweets?.some(({ id }) => id === tweetId)) {
    return 412;
  }

  const updatedTweets = submittedTweets.filter(({ id }) => id !== tweetId);

  const collection = await getCollection('campaigns');

  await collection.updateOne(
    { _id },
    { $set: { submittedTweets: updatedTweets } }
  );
  await tweetCollection.deleteMany({ id: tweetId });

  return 204;
};

export const addTweetToCampaign = async (
  id: string,
  campaign: Campaign,
  authorId: string,
  userId: string,
  createdAt: Date
) => {
  const { _id, submittedTweets = [] } = campaign;

  // This is extra to guarantee we don't accidentally wipe out campaign tweets
  if (submittedTweets.length === 0) {
    const [{ submittedTweets: s2 = [] }] = await getCampaigns(userId, { _id });
    submittedTweets.push(...s2);
  }

  const { influencer, manager } = campaign.permissions || {};

  // User isn't a manager or influencer on the campaign
  if (!influencer && !manager) {
    return 403;
  }

  const collection = await getCollection('campaigns');
  const tweetCollection = await getCollection('tweets');

  const existingTweet = await tweetCollection.findOne({ id });

  // Tweet is already submitted and not a manager
  if (existingTweet !== null) {
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

  submittedTweets.push(newTweet);

  await collection.updateOne({ _id }, { $set: { submittedTweets } });
  await tweetCollection.insertOne(newTweet);

  return 204;
};
