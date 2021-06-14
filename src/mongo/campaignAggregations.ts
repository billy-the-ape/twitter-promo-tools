export type CampaignAggregationOption =
  | 'datePercentage'
  | 'tweetPercentage'
  | 'fullUsers';

export const datePercentage: object[] = [
  {
    $addFields: {
      tempSubtractNow: {
        $subtract: [
          new Date(),
          {
            $cond: {
              if: {
                $lte: ['$startDate', null],
              },
              then: new Date(0),
              else: '$startDate',
            },
          },
        ],
      },
      tempSubtractStart: {
        $subtract: [
          {
            $cond: {
              if: {
                $lte: ['$endDate', null],
              },
              then: new Date(0),
              else: '$endDate',
            },
          },
          {
            $cond: {
              if: {
                $lte: ['$startDate', null],
              },
              then: new Date(0),
              else: '$startDate',
            },
          },
        ],
      },
    },
  },
  {
    $addFields: {
      datePercentage: {
        $cond: {
          if: {
            $or: [
              { $eq: ['$tempSubtractStart', 0] },
              { $lte: ['$tempSubtractNow', 0] },
            ],
          },
          then: 0,
          else: {
            $divide: ['$tempSubtractNow', '$tempSubtractStart'],
          },
        },
      },
    },
  },
  {
    // Remove temp fields
    $unset: ['tempSubtractNow', 'tempSubtractStart'],
  },
];

export const tweetPercentage: object[] = [
  {
    $addFields: {
      tweetPercentage: {
        $cond: {
          if: {
            $or: [
              {
                $lte: ['$tweetCount', null],
              },
              {
                $lte: ['$userTweets', null],
              },
            ],
          },
          then: 0,
          else: {
            $divide: [{ $size: '$userTweets' }, '$tweetCount'],
          },
        },
      },
    },
  },
];

export const fullUsers: object[] = [
  {
    // Get full manager users
    $lookup: {
      from: 'users',
      localField: 'managers.id',
      foreignField: 'id',
      as: 'u1',
    },
  },
  {
    // Get creator user
    $lookup: {
      from: 'users',
      localField: 'creator',
      foreignField: 'id',
      as: 'u2',
    },
  },
  {
    // Get full influencer users
    $lookup: {
      from: 'users',
      localField: 'influencers.id',
      foreignField: 'id',
      as: 'u3',
    },
  },
  {
    $addFields: {
      // Concat and get distinct users
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
    // Remove temp fields
    $unset: ['u1', 'u2', 'u3'],
  },
];
