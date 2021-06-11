import {
  deleteCampaigns,
  getCampaigns,
  getCampaignsForUser,
} from '@/mongo/campaigns';
import { Session } from '@/types';
import { ObjectId } from 'mongodb';
import type { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';

const handler: NextApiHandler = async (req, res) => {
  const { id } = req.query;
  const idsArray = (Array.isArray(id) ? id : id.split(',')).map(
    (id) => new ObjectId(id)
  );
  const session = (await getSession({ req })) as Session;
  /*
   */
  switch (req.method) {
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
