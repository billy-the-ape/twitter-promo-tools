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
  Divider,
  Hidden,
  ListItemIcon,
  TextField,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TwitterIcon from '@material-ui/icons/Twitter';
import { AvatarGroup } from '@material-ui/lab';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import Menu from './MenuWithTrigger';

const useStyles = makeStyles(({ breakpoints, spacing, palette }) => ({
  campaignItemRoot: {
    backgroundColor: palette.background.default,
  },
  spaced: {
    margin: spacing(0, 1),
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
  },
}));

export type CampaignListItemProps = {
  campaign: Campaign;
  setEditCampaign?: (c: Campaign) => void;
  setDeleteCampaign?: (c: Campaign) => void;
};

const TWEET_LINK_REGEX =
  /^(https?:\/\/)?twitter.com\/(\w){1,15}\/status\/(?<id>[0-9]+)/i;

const CampaignListItem: React.FC<CampaignListItemProps> = ({
  campaign,
  setEditCampaign,
  setDeleteCampaign,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitTweet, setSubmitTweet] = useState(false);
  const [isTweetLinkError, setIsTweetLinkError] = useState(false);
  const [tweetLink, setTweetLink] = useState('');
  const isMobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();

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

  const tweetString = campaign.submittedTweets && campaign.submittedTweets.length ? 
  t('count_of_num_tweets', {
    count: campaign.submittedTweets.length,
    num: campaign.tweetCount
  }) : t('num_tweets', {
    num: campaign.tweetCount
  });

  return (
    <Accordion
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
          {(!isExpanded || !isMobile) && !(isMobile && submitTweet) && (
            <Box
              maxWidth={isMobile ? '50%' : '40%'}
              display="flex"
              alignItems="center"
            >
              <Typography className={classes.spaced} variant="body1" noWrap>
                {campaign.name}
              </Typography>
            </Box>
          )}
          {submitTweet && (
            <TextField
              className={classes.submitText}
              label={t('submit_tweet_full')}
              autoFocus
              error={isTweetLinkError}
              variant="outlined"
              value={tweetLink}
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
          )}
          {!submitTweet && (
            <Box display="flex" alignItems="center">
              <Hidden smDown>
                <Box display="flex" flexDirection="column" alignItems="center" mr={3}>
                  <Box display="flex" alignItems="center" mr={1}>
                    {campaign.tweetCount && (
                      <Typography variant="caption">
                        {tweetString}
                      </Typography>
                    )}
                    {(campaign.startDate || campaign.endDate) && (
                      <Box>
                        <Typography
                          className={classes.spaced}
                          variant="caption"
                        >
                          {formatDate(campaign.startDate)}
                        </Typography>
                        -
                        <Typography
                          className={classes.spaced}
                          variant="caption"
                        >
                          {formatDate(campaign.endDate)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {campaign.submittedTweets && campaign.submittedTweets.length && (
                    <Typography variant="caption">
                      {t('time_since_last_tweet', {
                        timeSince: formatDateSince(
                          campaign.submittedTweets[0].createdAt
                        ),
                      })}
                    </Typography>
                  )}
                </Box>
              </Hidden>
              {campaign.influencers && !!campaign.influencers.length && (
                <Hidden xsDown>
                  <AvatarGroup spacing="small" max={5}>
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
              <Menu id={`menu-${campaign._id}`}>
                {campaign.permissions?.canTweet && (
                  <Menu.Item
                    onClick={(e) => {
                      e.stopPropagation();
                      setSubmitTweet(!submitTweet);
                    }}
                  >
                    <ListItemIcon>
                      <TwitterIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="inherit">
                      {t('submit_tweet')}
                    </Typography>
                  </Menu.Item>
                )}
                {setEditCampaign && campaign.permissions?.canEdit && (
                  <Menu.Item
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditCampaign(campaign);
                    }}
                  >
                    <ListItemIcon>
                      <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="inherit">{t('edit')}</Typography>
                  </Menu.Item>
                )}
                {setDeleteCampaign && campaign.permissions?.canDelete && (
                  <Menu.Item
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteCampaign(campaign);
                    }}
                  >
                    <ListItemIcon>
                      <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="inherit">{t('delete')}</Typography>
                  </Menu.Item>
                )}
              </Menu>
            </Box>
          )}
        </Box>
      </AccordionSummary>
      {campaign.description && (
        // ACCORDION DETAILS!!
        <AccordionDetails>
          <Box
            display="flex"
            width="100%"
            flexDirection="column"
            maxHeight="300px"
            overflow="auto"
          >
            {isMobile && (
              <>
                <Typography variant="body1">{campaign.name}</Typography>
                <Divider />
              </>
            )}
            <Hidden mdUp>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-around"
              >
                {campaign.tweetCount && (
                  <Typography variant="caption">
                    {campaign.tweetCount} Tweets
                  </Typography>
                )}
                {(campaign.startDate || campaign.endDate) && (
                  <div>
                    <Typography className={classes.spaced} variant="caption">
                      {formatDate(campaign.startDate)}
                    </Typography>
                    -
                    <Typography className={classes.spaced} variant="caption">
                      {formatDate(campaign.endDate)}
                    </Typography>
                  </div>
                )}
                {campaign.influencers && campaign.influencers.length && (
                  <Hidden smUp>
                    <AvatarGroup spacing="small" max={3}>
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
              <Divider />
            </Hidden>
            {campaign.description.split('\n').map((desc, i) => (
              <ReactMarkdown key={i}>{desc}</ReactMarkdown>
            ))}
          </Box>
        </AccordionDetails>
      )}
    </Accordion>
  );
};

export default CampaignListItem;
