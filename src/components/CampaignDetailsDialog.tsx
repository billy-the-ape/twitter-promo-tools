import { useIsMobile } from '@/hooks/useIsMobile';
import { formatDate } from '@/util';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import CampaignDetails, { CampaignDetailsProps } from './CampaignDetails';

const useStyles = makeStyles(({ spacing }) => ({
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

  return (
    <Dialog fullScreen={isMobile} maxWidth="md" {...dialogProps}>
      <DialogTitle>
        {campaign.name}
        <Typography className={classes.dateText} variant="caption" noWrap>
          {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <CampaignDetails
          showAvatars
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
