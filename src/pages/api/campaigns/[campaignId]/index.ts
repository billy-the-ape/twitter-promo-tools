import {
  addTweetsToCampaign,
  deleteCampaigns,
  getCampaigns,
} from '@/mongo/campaigns';
import { Session, SubmittedTweet } from '@/types';
import { fetchTwitterApi } from '@/util';
import { ObjectId } from 'mongodb';
import type { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';

const handler: NextApiHandler = async (req, res) => {
  const { campaignId } = req.query;
  const idsArray = (
    Array.isArray(campaignId) ? campaignId : campaignId.split(',')
  ).map((campaignId) => new ObjectId(campaignId));
  const session = (await getSession({ req })) as Session;

  switch (req.method) {
    // Method indicating a user is submitting a tweet to this campaign
    case 'POST': {
      const tweetIds = JSON.parse(req.body) as string[];

      const tweetResult = await fetchTwitterApi(
        `/tweets?ids=${tweetIds.join()}&expansions=author_id&tweet.fields=created_at`
      );

      // Check tweet exists
      if (!tweetResult || !tweetResult.length || Array.isArray(campaignId)) {
        console.error('TWEET NOT FOUND');
        res.status(404).send({});
        return;
      }

      const campaigns = await getCampaigns(
        session.user.id,
        {
          _id: new ObjectId(campaignId),
        },
        false
      );
      if (!campaigns || !campaigns.length) {
        console.error('CAMPAIGN NOT FOUND');
        res.status(404).send({});
        return;
      }
      const [campaign] = campaigns;

      // Check tweet is from current user or manager
      if (
        !campaign.permissions?.manager &&
        tweetResult.some(({ author_id }) => {
          return author_id !== session.user.id;
        })
      ) {
        res.status(400).send({});
        return;
      }

      const submittedTweets: SubmittedTweet[] = tweetResult.map(
        ({ id, author_id: authorId, created_at: createdAt }) => ({
          id,
          authorId,
          createdAt: new Date(createdAt),
        })
      );

      const resultsArray = await addTweetsToCampaign(
        session.user.id,
        campaign,
        submittedTweets
      );
      /* for (const {
        id,
        author_id: authorId,
        created_at: createdAt,
      } of tweetResult) {
        const result = await addTweetToCampaign(
          id,
          campaign,
          authorId,
          session.user.id,
          new Date(createdAt)
        );

        resultsArray.push(result);
      } */

      const failResponse = resultsArray.find((code) => code !== 204);

      if (failResponse) {
        res.status(failResponse).send(resultsArray);
        return;
      }

      res.status(204).send({});
      return;
    }
    case 'DELETE': {
      const deleteSuccess = await deleteCampaigns(session.user.id, idsArray);
      if (deleteSuccess) {
        res.status(204).send({});
      } else {
        res.status(403).send({});
      }
      return;
    }
    case 'GET': {
      const campaigns = await getCampaigns(
        session.user.id,
        {
          _id: { $in: idsArray },
        },
        true
      );
      res.status(200).json(campaigns);
    }
  }
};

export default handler;
