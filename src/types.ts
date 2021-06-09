import { ObjectId } from 'mongodb';
import { Session as NextSession } from 'next-auth';

export type User = NextSession['user'] & {
  _id?: ObjectId;
  sub: string;
  addedDate?: Date;
  screenName?: string;
  location?: string;
}

export type Session = Omit<NextSession, 'user'> & {
  user: User;
};

export type Tweet = {
  _id?: ObjectId;
  note?: string;
  date?: Date;
}

export type Campaign = {
  name: string;
  tweets: Tweet[];
  creator: string;
  // twitter ids
  influencers: string[];
  // twitter ids
  managers: string[];

  _id?: ObjectId;
  description?: string;
  image?: string;
  startDate?: Date;
  endDate?: Date;
  addedDate?: Date;
  pricePer?: number;
  currency?: string;
}

export type CollectionTypeMap = {
  'users': User;
  'campaigns': Campaign;
}