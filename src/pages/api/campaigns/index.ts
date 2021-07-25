import { getCampaignsForUser, upsertCampaign } from '@/mongo/campaigns';
import { ValidSort } from '@/mongo/campaignSorts';
import { Campaign, Session } from '@/types';
import type { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';

const handler: NextApiHandler = async (req, res) => {
  try {
    const session = (await getSession({ req })) as Session;

    const {
      body,
      method,
      query: { search, sort, page, showHidden },
    } = req;

    switch (method) {
      case 'GET':
        const realSort = (
          !!sort && !Array.isArray(sort) ? sort : 'urgency'
        ) as ValidSort;
        const realPage = !!page && !Array.isArray(page) ? Number(page) : 0;

        res.status(200).json(
          await getCampaignsForUser(
            session.user.id,
            showHidden === 'true',
            typeof search === 'string' && search !== '' ? search : undefined,
            {
              fullUsers: true,
              completionPercentage: true,
            },
            realSort,
            realPage
          )
        );
        return;
      case 'POST':
        const campaign = JSON.parse(body) as Campaign;
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
