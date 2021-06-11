import type { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';

const handler: NextApiHandler = async (req, res) => {
  const session = await getSession({ req });

  switch (req.method) {
    case 'POST':
      break;
    case 'GET':
      break;
  }

  res.status(200).json({});
};

export default handler;
