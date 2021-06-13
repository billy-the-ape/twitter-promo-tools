import { useIsMobile } from '@/hooks/useIsMobile';
import { Campaign } from '@/types';
import { formatDate, formatDateSince, getFullUserData } from '@/util';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Hidden,
  IconButton,
  ListItemIcon,
  TextField,
  Theme,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CancelIcon from '@material-ui/icons/Cancel';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TwitterIcon from '@material-ui/icons/Twitter';
import { AvatarGroup } from '@material-ui/lab';
import { useSession } from 'next-auth/client';
import dynamic from 'next/dynamic';
import { useSnackbar } from 'notistack';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CampaignMenu from './CampaignMenu';

const CampaignDetails = dynamic(() => import('./CampaignDetails'), {
  ssr: false,
});

const useStyles = makeStyles<Theme, { isExpanded: boolean }>(
  ({ breakpoints, spacing, palette }) => ({
    campaignItemRoot: {
      backgroundColor: palette.background.default,
    },
    spaced: {
      margin: spacing(0, 1),
      maxWidth: spacing(13),
    },
    summaryContent: {
      maxWidth: '100%',
      [breakpoints.up('sm')]: {
        maxWidth: 'calc(100% - 36px)',
      },
    },
    summaryRoot: {
      justifyContent: 'space-between',
    },
    submitText: {
      alignSelf: 'center',
      margin: spacing(1),
      [breakpoints.up('sm')]: {
        margin: spacing(0, 5),
        width: '80%',
      },
    },
    submitButton: {
      height: '100%',
      marginRight: '-14px',
      zIndex: 1,
      borderRadius: '4px',
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      padding: '7px 16px',
    },
  })
);

export type CampaignListItemProps = {
  campaign: Campaign;
  mutate: () => void;
  setEditCampaign?: (c: Campaign) => void;
  setDeleteCampaign?: (c: Campaign) => void;
};

const TWEET_LINK_REGEX =
  /^(https?:\/\/)?twitter.com\/(\w){1,15}\/status\/(?<id>[0-9]+)/i;

const CampaignListItem: React.FC<CampaignListItemProps> = ({
  campaign,
  mutate,
  setEditCampaign,
  setDeleteCampaign,
}) => {
  const [{ user }] = useSession() as any;
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitTweet, setSubmitTweet] = useState(false);
  const [isTweetLinkError, setIsTweetLinkError] = useState(false);
  const [tweetLink, setTweetLink] = useState('');
  const [expandMembers, setExpandMembers] = useState(false);
  const isMobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles({ isExpanded });

  const handleTweetSubmit = async () => {
    const match = TWEET_LINK_REGEX.exec(tweetLink);
    if (!match) {
      setIsTweetLinkError(true);
      return;
    }
    setIsTweetLinkError(false);

    const { id } = match.groups || {};

    const { status } = await fetch(`/api/campaigns/${campaign._id}`, {
      method: 'POST',
      body: JSON.stringify([id]),
    });
    switch (status) {
      case 204:
        enqueueSnackbar(t('tweet_submitted'), { variant: 'success' });
        setTweetLink('');
        setSubmitTweet(false);
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

  const myTweets = useMemo(
    () =>
      campaign.submittedTweets?.filter(({ authorId }) => authorId === user.id),
    [campaign]
  );

  let tweetString = '';

  if (myTweets && myTweets.length) {
    if (campaign.tweetCount) {
      tweetString = t('time_since_last_tweet_num', {
        timeSince: formatDateSince(myTweets[0].createdAt),
        count: myTweets.length,
        num: campaign.tweetCount,
      });
    } else {
      tweetString = t('time_since_last_tweet', {
        timeSince: formatDateSince(myTweets[0].createdAt),
        count: myTweets.length,
      });
    }
  } else {
    t('num_tweets', {
      num: campaign.tweetCount,
    });
  }

  return (
    <Accordion
      expanded={isExpanded}
      className={classes.campaignItemRoot}
      onChange={(_, expanded) => setIsExpanded(expanded)}
    >
      <AccordionSummary
        classes={{ root: classes.summaryRoot, content: classes.summaryContent }}
        expandIcon={
          !isMobile && (
            <Tooltip
              title={isExpanded ? String(t('collapse')) : String(t('expand'))}
            >
              <ExpandMoreIcon />
            </Tooltip>
          )
        }
      >
        <Box
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          {submitTweet && (
            <>
              <TextField
                className={classes.submitText}
                label={t('submit_tweet_full')}
                autoFocus
                error={isTweetLinkError}
                variant="outlined"
                value={tweetLink}
                size="small"
                onClick={(e) => e.stopPropagation()}
                onChange={({ target: { value } }) => setTweetLink(value)}
                InputProps={{
                  endAdornment: (
                    <Button
                      className={classes.submitButton}
                      variant="contained"
                      color="primary"
                      disabled={!tweetLink}
                      onClick={handleTweetSubmit}
                    >
                      <AddIcon />
                    </Button>
                  ),
                }}
              />
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setSubmitTweet(false);
                }}
              >
                <CancelIcon />
              </IconButton>
            </>
          )}
          {!submitTweet && (
            <>
              <Box
                maxWidth={isMobile ? '50%' : '40%'}
                display="flex"
                flexDirection="column"
              >
                <Typography variant="body1" noWrap>
                  {campaign.name}
                </Typography>
                {isMobile && (
                  <Typography variant="body2" noWrap>
                    {formatDate(campaign.startDate)} -{' '}
                    {formatDate(campaign.endDate)}
                  </Typography>
                )}
              </Box>
              <Box display="flex" alignItems="center">
                {!isMobile && (campaign.startDate || campaign.endDate) && (
                  <Box mr={2}>
                    <Typography
                      className={classes.spaced}
                      component="span"
                      variant="body2"
                      noWrap
                    >
                      {formatDate(campaign.startDate)} -{' '}
                      {formatDate(campaign.endDate)}
                    </Typography>
                  </Box>
                )}
                {(!!campaign.tweetCount || !!myTweets?.length) && (
                  <Typography variant="caption" className={classes.spaced}>
                    {tweetString}
                  </Typography>
                )}
                {campaign.influencers && !!campaign.influencers.length && (
                  <Hidden xsDown>
                    <AvatarGroup
                      spacing="small"
                      max={5}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(true);
                        setExpandMembers(!expandMembers);
                      }}
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
                {/* CAMPAIGN ACTIONS!! */}
                <CampaignMenu
                  campaign={campaign}
                  onSubmitTweet={() => setSubmitTweet(true)}
                  onEditCampaign={
                    setEditCampaign && (() => setEditCampaign(campaign))
                  }
                  onDeleteCampaign={
                    setDeleteCampaign && (() => setDeleteCampaign(campaign))
                  }
                />
              </Box>
            </>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {isExpanded && (
          <CampaignDetails
            campaign={campaign}
            mutate={mutate}
            expandMembers={expandMembers}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default CampaignListItem;
