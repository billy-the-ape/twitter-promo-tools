import { User } from '@/types';
import { FilterQuery } from 'mongodb';

import { getCollection } from './util';

export const upsertUser = async (user: User) => {
  const collection = await getCollection('users');

  await collection.updateOne(
    {
      id: user.id,
    },
    {
      $set: user,
      $setOnInsert: { dateAdded: new Date() },
    },
    {
      upsert: true,
    }
  );
};

export const getUsers = async (filter: FilterQuery<User>) => {
  const collection = await getCollection('users');

  return await collection.find(filter).toArray();
};
