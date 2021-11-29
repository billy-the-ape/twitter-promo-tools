import { useIsMobile } from '@/hooks/useIsMobile';
import { Campaign, SubmittedTweet } from '@/types';
import { getFullUserData } from '@/util';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  Hidden,
  Paper,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { AvatarGroup } from '@material-ui/lab';
import clsx from 'clsx';
import { useSession } from 'next-auth/client';
import { useSnackbar } from 'notistack';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

import CampaignAvatars from './CampaignAvatars';
import CampaignCompletion from './CampaignCompletion';
import CsvButton from './CsvButton';
import TweetList from './TweetList';
import UserChip from './UserChip';
import UserChipGrid from './UserChipGrid';
import { deleteTweetFromCampaign } from './util/fetch';

export type CampaignDetailsProps = {
  campaign: Campaign;
  mutate: () => void;
  showAvatars?: boolean;
  expandMembers?: boolean;
  tweetString?: string;
};

const useStyles = makeStyles(({ spacing, palette }) => ({
  markDown: {
    margin: 0,
    lineHeight: spacing(2) + 'px',
  },
  userContainer: {
    padding: spacing(2),
    margin: spacing(2, 0),
  },
  tweetList: {
    marginTop: spacing(-1),
    marginBottom: spacing(2),
  },
  marginLeft: {
    marginLeft: spacing(2),
  },
  avatars: {
    justifyContent: 'center',
    cursor: 'pointer',
  },
  fadeBottom: {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      zIndex: '1',
      bottom: '0',
      left: '0',
      pointerEvents: 'none',
      backgroundImage: `linear-gradient(to bottom, ${fade(
        palette.background.default,
        0
      )}, ${fade(palette.background.default, 1)} 90%)`,
      width: '100%',
      height: '5em',
    },
  },
}));

const CampaignDetails: React.FC<CampaignDetailsProps> = ({
  expandMembers: expandMembersFromProps,
  campaign,
  mutate,
  tweetString,
  showAvatars,
}) => {
  const [{ user }] = useSession() as any;
  const [showTweets, setShowTweets] = useState(false);
  const [expandDescription, setExpandDescription] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const classes = useStyles();
  const [expandMembers, setExpandMembers] = useState(false);
  const isMobile = useIsMobile();
  const showAvatarGroup = isMobile || showAvatars;

  const userSubMap = useMemo(
    () =>
      !campaign.permissions?.manager
        ? {}
        : campaign.submittedTweets?.reduce<Record<string, SubmittedTweet[]>>(
            (acc, t) => ({
              ...acc,
              [t.authorId]: acc[t.authorId] ? [...acc[t.authorId], t] : [t],
            }),
            {}
          ) ?? {},
    [campaign]
  );

  const handleTweetDelete = async (tweetId: string) => {
    const success = await deleteTweetFromCampaign(
      String(campaign._id),
      tweetId
    );

    if (success) {
      enqueueSnackbar(t('tweet_deleted'), { variant: 'success' });
      mutate();
    } else {
      enqueueSnackbar(t('an_error_occurred'), { variant: 'error' });
    }
  };

  return (
    <Box display="flex" width="100%" flexDirection="column">
      <Box display="flex" flexDirection="column" width="100%">
        {/* TWEET LIST */}
        <Box className={classes.tweetList}>
          {isMobile && tweetString && (
            <Typography variant="body2" noWrap>
              {tweetString}
            </Typography>
          )}
          <Box display="flex">
            <Button
              variant="contained"
              size="small"
              onClick={() => setShowTweets(!showTweets)}
            >
              {showTweets
                ? t('hide_submitted_tweets')
                : t('show_submitted_tweets')}
            </Button>
            {campaign.permissions?.manager && (
              <CsvButton className={classes.marginLeft} campaign={campaign} />
            )}
          </Box>
          <Collapse in={showTweets}>
            <Box mt={1}>
              {(!!campaign.tweetPercentage || !!campaign.datePercentage) && (
                <CampaignCompletion
                  title={t('your_completion_stats')}
                  tweetPercentage={campaign.tweetPercentage}
                  datePercentage={campaign.datePercentage}
                />
              )}
              <TweetList
                tweets={campaign.userTweets || []}
                users={campaign.users || []}
                onDelete={handleTweetDelete}
                campaignName={campaign.name}
              />
              {campaign.permissions?.manager && (
                <>
                  {(!!campaign.submittedTweets || !!campaign.datePercentage) &&
                    !!campaign.tweetCount &&
                    !!campaign.influencers && (
                      <CampaignCompletion
                        title={t('campaign_completion_stats')}
                        tweetPercentage={
                          (campaign.submittedTweets?.length ?? 0) /
                          (campaign.tweetCount * campaign.influencers.length)
                        }
                        datePercentage={campaign.datePercentage}
                      />
                    )}
                  <TweetList
                    tweets={
                      campaign.submittedTweets?.filter(
                        ({ authorId }) => authorId !== user.id
                      ) || []
                    }
                    campaignName={campaign.name}
                    users={campaign.users || []}
                    onDelete={handleTweetDelete}
                  />
                </>
              )}
            </Box>
          </Collapse>
        </Box>
        {campaign.influencers && !!campaign.influencers.length && (
          <>
            {showAvatarGroup && (
              <CampaignAvatars
                campaign={campaign}
                className={classes.avatars}
                onClick={() => setExpandMembers(!expandMembers)}
                max={15}
              />
            )}
          </>
        )}
        <Collapse in={expandMembers || expandMembersFromProps}>
          {!!campaign.creator &&
            (() => {
              const { image, screenName } =
                campaign.users?.find(({ id }) => id === campaign.creator) ?? {};
              return (
                <Paper className={classes.userContainer}>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body1">
                      {t('owner_colon')}&nbsp;&nbsp;
                    </Typography>
                    <UserChip image={image!} screenName={screenName!} />
                  </Box>
                </Paper>
              );
            })()}
          {!!campaign.managers && (
            <Paper className={classes.userContainer}>
              <UserChipGrid
                users={campaign.managers ?? []}
                fullUserList={campaign.users ?? []}
                userSubMap={userSubMap}
              >
                <Typography variant="body1">{t('managers_colon')}</Typography>
              </UserChipGrid>
            </Paper>
          )}
          {!!campaign.influencers && (
            <Paper className={classes.userContainer}>
              <UserChipGrid
                users={campaign.influencers}
                fullUserList={campaign.users ?? []}
                userSubMap={userSubMap}
                datePercentage={campaign.datePercentage}
                requiredTweetCount={campaign.tweetCount}
              >
                <Typography variant="body1">
                  {t('influencers_colon')}
                </Typography>
              </UserChipGrid>
            </Paper>
          )}
        </Collapse>
      </Box>
      <Divider />
      {campaign.description && (
        <>
          <div className={clsx(!expandDescription && classes.fadeBottom)}>
            <Collapse in={expandDescription} collapsedHeight={100}>
              <div>
                {campaign.description.split('\n').map((desc, i) => (
                  <ReactMarkdown
                    remarkPlugins={[gfm]}
                    className={classes.markDown}
                    key={i}
                    linkTarget="_blank"
                  >
                    {desc}
                  </ReactMarkdown>
                ))}
              </div>
            </Collapse>
          </div>
          <Button onClick={() => setExpandDescription(!expandDescription)}>
            {expandDescription
              ? t('collapse_description')
              : t('expand_description')}
          </Button>
        </>
      )}
    </Box>
  );
};

export default CampaignDetails;
