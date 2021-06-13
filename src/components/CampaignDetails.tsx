import { useIsMobile } from '@/hooks/useIsMobile';
import { Campaign } from '@/types';
import { getFullUserData } from '@/util';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  Hidden,
  IconButton,
  Link,
  Paper,
  Typography,
  makeStyles,
} from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import { AvatarGroup } from '@material-ui/lab';
import { useSnackbar } from 'notistack';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

import UserChip from './UserChip';
import UserChipGrid from './UserChipGrid';

export type CampaignDetailsProps = {
  campaign: Campaign;
  mutate: () => void;
  expandMembers: boolean;
};

const useStyles = makeStyles(({ breakpoints, spacing }) => ({
  linkAvatar: {
    height: spacing(3),
    width: spacing(3),
    marginRight: spacing(1),
  },
  linkBox: {
    [breakpoints.down('sm')]: {
      justifyContent: 'space-around',
    },
  },
  markDown: {
    margin: 0,
    lineHeight: spacing(2) + 'px',
  },
  userContainer: {
    padding: spacing(2),
    margin: spacing(2, 0),
  },
}));

const CampaignDetails: React.FC<CampaignDetailsProps> = ({
  expandMembers: expandMembersFromProps,
  campaign,
  mutate,
}) => {
  const [showTweets, setShowTweets] = useState(false);
  const [expandDescription, setExpandDescription] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const classes = useStyles();
  const [expandMembers, setExpandMembers] = useState(false);

  const userSubCountMap = useMemo(
    () =>
      !campaign.permissions?.manager
        ? {}
        : campaign.submittedTweets?.reduce<Record<string, number>>(
            (acc, { authorId }) => ({
              ...acc,
              [authorId]: (acc[authorId] || 0) + 1,
            }),
            {}
          ) ?? {},
    [campaign]
  );

  const handleTweetDelete = async (tweetId: string) => {
    const { status } = await fetch(
      `/api/campaigns/${campaign._id}/${tweetId}`,
      {
        method: 'DELETE',
      }
    );

    if (status === 204) {
      enqueueSnackbar(t('tweet_deleted'), { variant: 'success' });
      mutate();
    } else {
      enqueueSnackbar(t('an_error_occurred'), { variant: 'error' });
    }
  };

  return (
    <Box display="flex" width="100%" flexDirection="column">
      <Box display="flex" alignItems="center" justifyContent="space-around">
        {campaign.influencers && !!campaign.influencers.length && (
          <Hidden smUp>
            <AvatarGroup
              onClick={() => setExpandMembers(!expandMembers)}
              spacing="small"
              max={15}
            >
              {campaign.influencers.map((u) => {
                const { screenName, image } =
                  getFullUserData(u, campaign.users!) ?? {};
                return (
                  <Avatar key={screenName} src={image!}>
                    {screenName?.substring(0, 1).toLocaleUpperCase()}
                  </Avatar>
                );
              })}
            </AvatarGroup>
          </Hidden>
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
                userSubCountMap={userSubCountMap}
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
                userSubCountMap={userSubCountMap}
              >
                <Typography variant="body1">
                  {t('influencers_colon')}
                </Typography>
              </UserChipGrid>
            </Paper>
          )}
        </Collapse>
      </Box>
      {/* TWEET LIST */}
      <Box>
        <Button
          variant="contained"
          size="small"
          onClick={() => setShowTweets(!showTweets)}
        >
          {showTweets ? t('hide_submitted_tweets') : t('show_submitted_tweets')}
        </Button>
        <Collapse in={showTweets}>
          <Box mt={2} display="flex" flexDirection="column">
            {campaign.submittedTweets?.map(({ id, authorId }) => {
              const { screenName, image } =
                campaign.users?.find(({ id }) => id === authorId) || {};
              const link = `twitter.com/${screenName}/status/${id}`;
              return (
                <Box
                  className={classes.linkBox}
                  display="flex"
                  alignItems="center"
                >
                  <Avatar className={classes.linkAvatar} src={image!}>
                    {screenName?.substr(0, 1).toLocaleUpperCase()}
                  </Avatar>
                  <Link href={`https://${link}`} target="_blank">
                    <Typography variant="inherit">
                      {isMobile ? `...${link.substring(20)}` : link}
                    </Typography>
                  </Link>
                  <IconButton
                    onClick={() => handleTweetDelete(id)}
                    size="small"
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        </Collapse>
      </Box>
      <Divider />
      {campaign.description && (
        <>
          <Collapse in={expandDescription} collapsedHeight={100}>
            <div>
              {campaign.description.split('\n').map((desc, i) => (
                <ReactMarkdown
                  remarkPlugins={[gfm]}
                  className={classes.markDown}
                  key={i}
                >
                  {desc}
                </ReactMarkdown>
              ))}
            </div>
          </Collapse>
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
