import { useIsInitialized } from '@/hooks/useIsInitialized';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSharedState } from '@/hooks/useSharedState';
import { Campaign } from '@/types';
import {
  calculatePercentOff,
  formatDate,
  formatDateSince,
  getFullUserData,
} from '@/util';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Divider,
  Hidden,
  IconButton,
  TextField,
  Theme,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CancelIcon from '@material-ui/icons/Cancel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { AvatarGroup } from '@material-ui/lab';
import { useSession } from 'next-auth/client';
import dynamic from 'next/dynamic';
import { useSnackbar } from 'notistack';
import { useMemo, useState } from 'react';
import GaugeChart from 'react-gauge-chart';
import { useTranslation } from 'react-i18next';

import CampaignMenu from './CampaignMenu';
import {
  patchHideCampaigns,
  patchUnhideCampaigns,
  submitTweetsToCampaign,
} from './util/fetch';

const CampaignDetails = dynamic(() => import('./CampaignDetails'), {
  ssr: false,
});

const useStyles = makeStyles<Theme, { isExpanded: boolean }>(
  ({ breakpoints, spacing, palette }) => ({
    campaignItemRoot: {
      backgroundColor: palette.background.default,
      position: 'relative',
    },
    completedOverlay: {
      position: 'absolute',
      pointerEvents: 'none',
      backgroundColor: palette.background.default,
      opacity: 0.7,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: 50,
      borderRadius: spacing(1),
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
    circle: {
      position: 'relative',
      top: '6px',
      marginRight: spacing(1),
      display: 'inline-block',
      height: spacing(1.5),
      width: spacing(1.5),
      borderRadius: '50%',
      border: `1px solid ${palette.text.primary}`,
    },
    /* gauge: {
      height: spacing(3),
      width: spacing(3),
    }, */
  })
);

export type CampaignListItemProps = {
  campaign: Campaign;
  mutate: () => void;
  setEditCampaign?: (c: Campaign) => void;
  setDeleteCampaign?: (c: Campaign) => void;
};

const TWEET_LINK_REGEX =
  /^(https?:\/\/)?(mobile\.)?twitter.com\/(\w){1,15}\/status\/(?<id>[0-9]+)/i;

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
  const hasDetailsExpanded = useIsInitialized(isExpanded);
  const completed =
    campaign.tweetCount &&
    campaign.tweetCount <= (campaign.userTweets?.length ?? 0);
  const [showHidden] = useSharedState('showHidden');

  const campaignId = String(campaign._id);

  const handleToggleHideCampaign = async () => {
    if (!campaign.hidden) {
      await patchHideCampaigns([campaignId]);
      mutate();
    } else {
      await patchUnhideCampaigns([campaignId]);
      mutate();
    }
  };

  const handleTweetSubmit = async () => {
    const links = tweetLink.split(/\s/).filter((l) => !!l);
    const ids = [];
    for (const link of links) {
      const match = TWEET_LINK_REGEX.exec(link);
      if (!match) {
        setIsTweetLinkError(true);
        continue;
      }
      setIsTweetLinkError(false);

      const { id } = match.groups || {};
      ids.push(id);
    }

    const status = await submitTweetsToCampaign(String(campaign._id), ids);

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

  if (!showHidden && campaign.hidden) {
    return null;
  }

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
        {(completed || campaign.hidden) && !isExpanded && (
          <div className={classes.completedOverlay}>&nbsp;</div>
        )}
        <Box
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          {submitTweet && (
            <>
              <Tooltip title={t('tweet_submit_explanation') as string}>
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
              </Tooltip>
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
                <Box display="flex" alignItems="center">
                  <Typography variant="body1" noWrap>
                    {campaign.name}
                  </Typography>
                  {!isMobile && (campaign.startDate || campaign.endDate) && (
                    <Box mr={2}>
                      <Typography
                        className={classes.spaced}
                        component="span"
                        variant="caption"
                        noWrap
                      >
                        {formatDate(campaign.startDate)} -{' '}
                        {formatDate(campaign.endDate)}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {isMobile && (campaign.startDate || campaign.endDate) && (
                  <Typography variant="body2" noWrap>
                    {formatDate(campaign.startDate)} -{' '}
                    {formatDate(campaign.endDate)}
                  </Typography>
                )}
              </Box>
              <Box display="flex" alignItems="center">
                <Hidden xsDown>
                  {/* INFO ABOUT LAST TWEET */}
                  {(!!campaign.tweetCount || !!myTweets?.length) && (
                    <Typography variant="caption" className={classes.spaced}>
                      {tweetString}
                    </Typography>
                  )}
                </Hidden>
                {/* TWEET GAUGE */}
                {campaign.permissions?.influencer && !!campaign.datePercentage && (
                  <>
                    <Tooltip title={t('chart_explanation') as string}>
                      <Box mb={-1} ml={-1.5}>
                        <GaugeChart
                          hideText
                          id={`chart-${campaign._id}`}
                          style={{ width: 80 }}
                          className={classes.gauge}
                          percent={calculatePercentOff(campaign)}
                        />
                      </Box>
                    </Tooltip>
                    <Hidden smDown>
                      <Divider orientation="vertical" />
                    </Hidden>
                  </>
                )}
                {campaign.users && !!campaign.users.length && (
                  <>
                    <Hidden xsDown>
                      <Tooltip title={t('expand_members') as string}>
                        <AvatarGroup
                          spacing="small"
                          max={5}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(true);
                            setExpandMembers(!expandMembers);
                          }}
                        >
                          {campaign.users.map((u) => {
                            const { screenName, image } =
                              getFullUserData(u, campaign.users!) ?? {};
                            return (
                              <Avatar key={screenName} src={image!}>
                                {screenName
                                  ?.substring(0, 1)
                                  .toLocaleUpperCase()}
                              </Avatar>
                            );
                          })}
                        </AvatarGroup>
                      </Tooltip>
                    </Hidden>
                  </>
                )}
                {/* CAMPAIGN ACTIONS!! */}
                <Hidden smDown>
                  <Divider orientation="vertical" />
                </Hidden>
                <CampaignMenu
                  campaign={campaign}
                  isHidden={!!campaign.hidden}
                  onHideCampaign={handleToggleHideCampaign}
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
        {hasDetailsExpanded && (
          <CampaignDetails
            campaign={campaign}
            mutate={mutate}
            expandMembers={expandMembers}
            tweetString={tweetString}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default CampaignListItem;
