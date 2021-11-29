import { submitTweetsToCampaign } from '@/components/util/fetch';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type UseSubmitTweetsProps = {
  setIsError: (value: boolean) => void;
  onCancel: () => void;
  mutate: () => void;
  campaignId: string;
};

const TWEET_LINK_REGEX =
  /^(https?:\/\/)?(mobile\.)?twitter.com\/(\w){1,15}\/status\/(?<id>[0-9]+)/i;

export const useSubmitTweets = ({
  setIsError,
  onCancel,
  mutate,
  campaignId,
}: UseSubmitTweetsProps) => {
  const [tweetLink, setTweetLink] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const submitTweets = async () => {
    const links = tweetLink.split(/\s/).filter((l) => !!l);
    const ids = [];
    for (const link of links) {
      const match = TWEET_LINK_REGEX.exec(link);
      if (!match) {
        setIsError(true);
        continue;
      }
      setIsError(false);

      const { id } = match.groups || {};
      ids.push(id);
    }

    const status = await submitTweetsToCampaign(campaignId, ids);

    switch (status) {
      case 204:
        enqueueSnackbar(t('tweet_submitted'), { variant: 'success' });
        setTweetLink('');
        onCancel();
        mutate();
        break;
      case 400:
        enqueueSnackbar(t('tweet_wrong_user'), { variant: 'error' });
        break;
      case 409:
        enqueueSnackbar(t('tweet_already_submitted'), { variant: 'error' });
        break;
      case 418:
        enqueueSnackbar(t('user_not_influencer'), { variant: 'error' });
        break;
      default:
        enqueueSnackbar(t('an_error_occurred'), { variant: 'error' });
    }
  };

  return {
    tweetLink,
    setTweetLink,
    submitTweets,
  };
};
