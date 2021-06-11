import { getCampaignsForUser, upsertCampaign } from '@/mongo/campaigns';
import { Campaign, Session } from '@/types';
import type { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';

const handler: NextApiHandler = async (req, res) => {
  try {
    const session = (await getSession({ req })) as Session;

    switch (req.method) {
      case 'GET':
        res.status(200).json(await getCampaignsForUser(session.user.id));
        return;
      case 'POST':
        const campaign = JSON.parse(req.body) as Campaign;
        const status = !campaign._id ? 201 : 200;
        res
          .status(status)
          .json(await upsertCampaign(session.user.id, campaign));
        return;
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

export default handler;
