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
        const result = await upsertCampaign(session.user.id, campaign);

        if (!result) {
          res.status(403).send({});
          return;
        }

        res.status(!campaign._id ? 201 : 200).json(result);
        return;
    }
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
};

export default handler;
