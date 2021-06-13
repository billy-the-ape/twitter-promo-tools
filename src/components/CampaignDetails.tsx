import { useIsMobile } from '@/hooks/useIsMobile';
import { Campaign } from '@/types';
import { getFullUserData } from '@/util';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Hidden,
  IconButton,
  Link,
  Typography,
  makeStyles,
} from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import { AvatarGroup } from '@material-ui/lab';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

export type CampaignDetailsProps = {
  campaign: Campaign;
  mutate: () => void;
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
    lineHeight: 0,
  },
}));

const CampaignDetails: React.FC<CampaignDetailsProps> = ({
  campaign,
  mutate,
}) => {
  const [showTweets, setShowTweets] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const classes = useStyles();

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
    <Box
      display="flex"
      width="100%"
      flexDirection="column"
      maxHeight="300px"
      overflow="auto"
    >
      <Hidden mdUp>
        <Box display="flex" alignItems="center" justifyContent="space-around">
          {campaign.influencers && !!campaign.influencers.length && (
            <Hidden smUp>
              <AvatarGroup spacing="small" max={15}>
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
        </Box>
      </Hidden>
      {campaign.submittedTweets && !!campaign.submittedTweets.length && (
        /* TWEET LIST */
        <Box mt={2}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setShowTweets(!showTweets)}
          >
            {showTweets
              ? t('hide_submitted_tweets')
              : t('show_submitted_tweets')}
          </Button>
          {showTweets && (
            <Box mt={2} display="flex" flexDirection="column">
              {campaign.submittedTweets.map(({ id, authorId }) => {
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
          )}
        </Box>
      )}
      <Divider />
      {campaign.description &&
        campaign.description.split('\n').map((desc, i) => (
          <ReactMarkdown
            remarkPlugins={[gfm]}
            className={classes.markDown}
            key={i}
          >
            {desc}
          </ReactMarkdown>
        ))}
    </Box>
  );
};

export default CampaignDetails;
