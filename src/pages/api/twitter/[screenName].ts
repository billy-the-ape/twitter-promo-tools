import { getUsers, upsertUser } from '@/mongo/users';
import { disconnect } from '@/mongo/util';
import { TwitterUser, User } from '@/types';
import { fetchTwitterApi } from '@/util';
import { mapTwitterToUsers } from '@/util';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler<User[]> = async (req, res) => {
  const { screenName } = req.query;
  const namesArray = Array.isArray(screenName)
    ? screenName
    : screenName.split(',');

  const users = await getUsers({ screenName: { $in: namesArray } });
  const unknownNames = namesArray.filter(
    (n) => !users.find(({ screenName }) => screenName === n)
  );

  if (!unknownNames.length) {
    return res.status(200).json(users);
  }

  const data = await fetchTwitterApi<TwitterUser[]>(
    `/users/by?usernames=${unknownNames.join()}&user.fields=profile_image_url,location`
  );

  const newUsers = mapTwitterToUsers(data);
  newUsers.forEach(upsertUser);

  const result = [...users, ...newUsers];
  disconnect();

  return res.status(200).json(result);
};

export default handler;
