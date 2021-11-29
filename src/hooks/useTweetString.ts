import { Campaign } from '@/types';
import { formatDateSince } from '@/util';
import { useSession } from 'next-auth/client';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type UseTweetStringProps = {
  campaign: Campaign;
};

export const useTweetString = ({ campaign }: UseTweetStringProps): string => {
  const { t } = useTranslation();
  const [{ user }] = useSession() as any;
  const myTweets = useMemo(
    () =>
      campaign.submittedTweets?.filter(({ authorId }) => authorId === user.id),
    [campaign]
  );
  if (myTweets && myTweets.length) {
    if (campaign.tweetCount) {
      return t('time_since_last_tweet_num', {
        timeSince: formatDateSince(myTweets[0].createdAt),
        count: myTweets.length,
        num: campaign.tweetCount,
      });
    } else {
      return t('time_since_last_tweet', {
        timeSince: formatDateSince(myTweets[0].createdAt),
        count: myTweets.length,
      });
    }
  }
  return '';
};
