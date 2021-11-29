import { useTweetString } from '@/hooks/useTweetString';
import { Campaign } from '@/types';
import { formatDate } from '@/util';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
  makeStyles,
} from '@material-ui/core';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import CampaignAvatars from './CampaignAvatars';
import CampaignMenu from './CampaignMenu';
import CampaignProgressGauge from './CampaignProgressGauge';
import CampaignTweetInput from './CampaignTweetInput';

const CampaignDetailsDialog = dynamic(() => import('./CampaignDetailsDialog'), {
  ssr: false,
});

export type CampaignCardItemProps = {
  campaign: Campaign;
  mutate: () => void;
  setDeleteCampaign: React.Dispatch<React.SetStateAction<Campaign | null>>;
  setEditCampaign: React.Dispatch<React.SetStateAction<Campaign | null>>;
};

const useStyles = makeStyles(({ spacing, palette }) => ({
  cardRoot: {
    backgroundColor: palette.background.default,
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonLabel: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    '&>*': {
      marginBottom: spacing(1),
    },
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: spacing(0, 2),
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
  titleButton: {
    marginLeft: spacing(-1),
    marginRight: spacing(-1),
    minWidth: '100%',
  },
}));

const CampaignCardItem: React.FC<CampaignCardItemProps> = ({
  campaign,
  mutate,
  setDeleteCampaign,
  setEditCampaign,
}) => {
  const tweetString = useTweetString({ campaign });
  const classes = useStyles();
  const completed =
    campaign.tweetCount &&
    campaign.tweetCount <= (campaign.userTweets?.length ?? 0);
  const [showDetails, setShowDetails] = useState(false);
  const [expandMembers, setExpandMembers] = useState(false);
  const [submitTweet, setSubmitTweet] = useState(false);

  // TODO: HANDLE SUBMIT TWEET

  return (
    <Card className={classes.cardRoot}>
      {(completed || campaign.hidden) && (
        <div className={classes.completedOverlay}>&nbsp;</div>
      )}
      <CardContent className={classes.cardContent}>
        <Button
          className={classes.titleButton}
          onClick={() => setShowDetails(true)}
          classes={{ label: classes.buttonLabel }}
        >
          <Typography variant="h5">{campaign.name}</Typography>
          <Typography component="div" variant="caption" noWrap>
            {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
          </Typography>
          <Typography component="div" variant="caption">
            {tweetString}
          </Typography>
        </Button>
        <CampaignAvatars
          campaign={campaign}
          onClick={() => {
            setExpandMembers(true);
            setShowDetails(true);
          }}
        />
        {submitTweet && (
          <CampaignTweetInput
            campaignId={String(campaign._id)}
            mutate={mutate}
            onCancel={() => setSubmitTweet(false)}
          />
        )}
      </CardContent>
      <CardActions className={classes.cardActions}>
        <CampaignProgressGauge campaign={campaign} />
        <CampaignMenu
          showMobileIcons
          mutate={mutate}
          campaign={campaign}
          onSubmitTweet={() => setSubmitTweet(true)}
          onEditCampaign={setEditCampaign && (() => setEditCampaign(campaign))}
          onDeleteCampaign={
            setDeleteCampaign && (() => setDeleteCampaign(campaign))
          }
        />
      </CardActions>
      {showDetails && (
        <CampaignDetailsDialog
          campaign={campaign}
          mutate={mutate}
          expandMembers={expandMembers}
          tweetString={tweetString}
          open
          onClose={() => {
            setExpandMembers(false);
            setShowDetails(false);
          }}
        />
      )}
    </Card>
  );
};

export default CampaignCardItem;
