import { ObjectId } from 'mongodb';
import { Session as NextSession } from 'next-auth';

export type User = NextSession['user'] & {
  _id?: ObjectId;
  id: string;
  addedDate?: Date;
  screenName?: string;
  location?: string;
};

export type TwitterUser = {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
};

export type Session = Omit<NextSession, 'user'> & {
  user: User;
};

export type Tweet = {
  _id?: ObjectId;
  note?: string;
  date?: Date;
};

export type CampaignPermissions = {
  canDelete: boolean;
  canEdit: boolean;
};

export type Campaign = {
  name: string;
  creator: string; // twitter id of creator
  dateAdded: Date;

  influencers?: User[];
  managers?: User[];
  tweetCount?: number;
  permissions?: CampaignPermissions;
  // tweets?: Tweet[];

  _id?: ObjectId | null;
  description?: string | null;
  image?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  addedDate?: Date | null;
  pricePer?: number | null;
  currency?: string | null;
};

export type CollectionTypeMap = {
  users: User;
  campaigns: Campaign;
};
