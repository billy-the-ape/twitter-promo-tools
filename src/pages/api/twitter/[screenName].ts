import type { NextApiHandler } from 'next'
import { getUsers, upsertUser } from '@/mongo/users';
import { fetchJson } from '@/util';
import { User } from '@/types';
import { mapTwitterToUsers } from '@/util';

const handler: NextApiHandler<User[]> = async (req, res) => {
  const { screenName } = req.query;
  const namesArray = Array.isArray(screenName) ? screenName : screenName.split(',');

  const users = await getUsers({ screenName: { $in: namesArray } });
  const unknownNames = namesArray.filter((n) => !users.find(({ screenName }) => screenName === n))

  if (!unknownNames.length) {
    return res.status(200).json(users);
  }

  const { data = [] } = await fetchJson(`https://api.twitter.com/2/users/by?usernames=${unknownNames.join()}&user.fields=profile_image_url,location`, {
    headers: {
      Authorization: `Bearer ${process.env.TWITTER_BEARER}`
    }
  });

  const newUsers = mapTwitterToUsers(data);
  newUsers.forEach(upsertUser);

  const result = [...users, ...newUsers];

  return res.status(200).json(result);
}

export default handler;
