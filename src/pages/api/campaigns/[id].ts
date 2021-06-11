import {
  addTweetToCampaign,
  deleteCampaigns,
  getCampaigns,
} from '@/mongo/campaigns';
import { Session } from '@/types';
import { fetchTwitterApi } from '@/util';
import { ObjectId } from 'mongodb';
import type { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';

const handler: NextApiHandler = async (req, res) => {
  const { id } = req.query;
  const idsArray = (Array.isArray(id) ? id : id.split(',')).map(
    (id) => new ObjectId(id)
  );
  const session = (await getSession({ req })) as Session;

  switch (req.method) {
    // Method indicating a user is submitting a tweet to this campaign
    case 'POST':
      const tweetIds = JSON.parse(req.body) as string[];

      const tweetResult = await fetchTwitterApi(
        `/tweets?ids=${tweetIds.join()}&expansions=author_id`
      );

      // Check tweet exists
      if (!tweetResult || !tweetResult.length || Array.isArray(id)) {
        res.status(404).send({});
        return;
      }

      // Check tweet is from current user
      const [{ author_id: authorId }] = tweetResult;
      if (authorId !== session.user.id) {
        res.status(400).send({});
        return;
      }

      for (const tid of tweetIds) {
        const result = await addTweetToCampaign(tid, id, authorId);

        if (result !== 204) {
          res.status(result).send({});
          return;
        }
      }

      res.status(204).send({});
      return;
    case 'DELETE':
      const deleteSuccess = await deleteCampaigns(session.user.id, idsArray);
      if (deleteSuccess) {
        res.status(204).send({});
      } else {
        res.status(403).send({});
      }
      return;
    case 'GET':
      const campaigns = await getCampaigns(session.user.id, {
        _id: { $in: idsArray },
      });
      res.status(200).json(campaigns);
  }
};

export default handler;
