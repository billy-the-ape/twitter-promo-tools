export type CampaignAggregationOption = 'completionPercentage' | 'fullUsers';

export const completionPercentage: object[] = [
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
  {
    $addFields: {
      completionOffBy: {
        $cond: {
          if: {
            $or: [
              { $eq: ['$datePercentage', 0] },
              { $gte: ['$tweetPercentage', 1] },
            ],
          },
          then: 0,
          else: {
            $add: [
              { $subtract: ['$datePercentage', '$tweetPercentage'] },
              0.4,
              {
                $cond: {
                  if: { $eq: ['$tweetPercentage', 0] },
                  then: 0.33,
                  else: 0,
                },
              },
            ],
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
