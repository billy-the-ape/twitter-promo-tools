import { deleteTweet, getCampaigns } from '@/mongo/campaigns';
import { Session } from '@/types';
import { ObjectId } from 'mongodb';
import { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';

const handler: NextApiHandler = async (req, res) => {
  const session = (await getSession({ req })) as Session;
  const { campaignId, tweetId } = req.query as {
    campaignId: string;
    tweetId: string;
  };
  switch (req.method) {
    case 'DELETE':
      const campaigns = await getCampaigns(session.user.id, {
        _id: new ObjectId(campaignId),
      });
      if (!campaigns || !campaigns.length) {
        res.status(404).send({});
      }
      const statusCode = await deleteTweet(
        session.user.id,
        tweetId,
        campaigns[0]
      );
      res.status(statusCode).send({});
      break;
  }
};

export default handler;
