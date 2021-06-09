import { getCollection } from './util';
import { User } from 'types';

export const upsertUser = async (user: User) => {
  const collection = await getCollection("users");

  await collection.updateOne({
    _id: user.sub,
  }, {
    $set: user,
    $setOnInsert: { dateAdded: new Date() },
  }, {
    upsert: true,
  });
};
