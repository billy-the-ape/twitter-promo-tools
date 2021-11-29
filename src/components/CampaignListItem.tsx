import { useIsInitialized } from '@/hooks/useIsInitialized';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSharedState } from '@/hooks/useSharedState';
import { useSubmitTweets } from '@/hooks/useSubmitTweets';
import { useTweetString } from '@/hooks/useTweetString';
import { Campaign } from '@/types';
import { formatDate } from '@/util';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Hidden,
  Theme,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CampaignAvatars from './CampaignAvatars';
import CampaignMenu from './CampaignMenu';
import CampaignProgressGauge from './CampaignProgressGauge';
import CampaignTweetInput from './CampaignTweetInput';

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
  })
);

export type CampaignListItemProps = {
  campaign: Campaign;
  mutate: () => void;
  setEditCampaign?: (c: Campaign) => void;
  setDeleteCampaign?: (c: Campaign) => void;
};

const CampaignListItem: React.FC<CampaignListItemProps> = ({
  campaign,
  mutate,
  setEditCampaign,
  setDeleteCampaign,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitTweet, setSubmitTweet] = useState(false);
  const [isTweetLinkError, setIsTweetLinkError] = useState(false);
  const [expandMembers, setExpandMembers] = useState(false);
  const isMobile = useIsMobile();
  const classes = useStyles({ isExpanded });
  const hasDetailsExpanded = useIsInitialized(isExpanded);
  const completed =
    campaign.tweetCount &&
    campaign.tweetCount <= (campaign.userTweets?.length ?? 0);
  const [showHidden] = useSharedState('showHidden');

  if (!showHidden && campaign.hidden) {
    return null;
  }

  const tweetString = useTweetString({ campaign });

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
            <CampaignTweetInput
              className={classes.submitText}
              campaignId={String(campaign._id)}
              onCancel={() => setSubmitTweet(false)}
              mutate={mutate}
            />
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
                  {!!campaign.tweetCount && (
                    <Typography variant="caption" className={classes.spaced}>
                      {tweetString}
                    </Typography>
                  )}
                </Hidden>
                {/* TWEET GAUGE */}
                {campaign.permissions?.influencer && !!campaign.datePercentage && (
                  <>
                    <CampaignProgressGauge campaign={campaign} />
                    <Hidden smDown>
                      <Divider orientation="vertical" />
                    </Hidden>
                  </>
                )}
                {campaign.users && !!campaign.users.length && (
                  <>
                    <Hidden xsDown>
                      <CampaignAvatars
                        campaign={campaign}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(true);
                          setExpandMembers(!expandMembers);
                        }}
                      />
                    </Hidden>
                  </>
                )}
                {/* CAMPAIGN ACTIONS!! */}
                <Hidden smDown>
                  <Divider orientation="vertical" />
                </Hidden>
                <CampaignMenu
                  campaign={campaign}
                  mutate={mutate}
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
