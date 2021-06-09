import { FreeBreakfastOutlined } from '@material-ui/icons';
import type { NextApiHandler } from 'next'
import { getSession } from 'next-auth/client'
import { Campaign, Session } from '@/types';

import { getCampaigns, upsertCampaign } from '@/mongo/campaigns';

const handler: NextApiHandler = async (req, res) => {
  try {
    const session = await getSession({ req }) as Session;

    switch (req.method) {
      case 'GET':
        res.status(200).json(await getCampaigns(session.user.sub));
        return;
      case 'POST':
        const campaign = JSON.parse(req.body) as Campaign
        const status = !campaign._id ? 201 : 200;
        res.status(status).json(await upsertCampaign(session.user.sub, campaign));
        return;
    }
  } catch (e) {
    res.status(500).json(e);
  }
};

export default handler;
