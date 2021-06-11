import type { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';

const handler: NextApiHandler = async (req, res) => {
  const session = await getSession({ req });
  console.log({ session });

  res.status(200).json({});
};

export default handler;
