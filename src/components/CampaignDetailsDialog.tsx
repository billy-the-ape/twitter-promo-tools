import { useIsMobile } from '@/hooks/useIsMobile';
import { formatDate } from '@/util';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CampaignDetails, { CampaignDetailsProps } from './CampaignDetails';
import CampaignMenu from './CampaignMenu';
import CampaignTweetInput from './CampaignTweetInput';

const useStyles = makeStyles(({ spacing, breakpoints }) => ({
  dateText: {
    margin: spacing(1, 2),
  },
}));

export type CampaignDetailsDialogProps = CampaignDetailsProps &
  Omit<DialogProps, 'onClose'> & {
    onClose: () => void;
  };

const CampaignDetailsDialog: React.FC<CampaignDetailsDialogProps> = ({
  campaign,
  mutate,
  expandMembers,
  tweetString,
  ...dialogProps
}) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const classes = useStyles();
  const [submitTweet, setSubmitTweet] = useState(false);

  return (
    <Dialog fullScreen={isMobile} maxWidth="md" {...dialogProps}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between">
          <div>
            {campaign.name}
            <Typography className={classes.dateText} variant="caption" noWrap>
              {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
            </Typography>
          </div>
          <CampaignMenu
            noEdit
            showMobileIcons
            mutate={mutate}
            campaign={campaign}
            onSubmitTweet={() => setSubmitTweet(true)}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        {submitTweet && (
          <Box mb={2} display="flex">
            <CampaignTweetInput
              campaignId={String(campaign._id)}
              mutate={mutate}
              onCancel={() => setSubmitTweet(false)}
            />
          </Box>
        )}
        <CampaignDetails
          showAvatars
          defaultExpandDescription
          campaign={campaign}
          mutate={mutate}
          expandMembers={expandMembers}
          tweetString={tweetString}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={dialogProps.onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampaignDetailsDialog;
