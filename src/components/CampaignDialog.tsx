import { useIsMobile } from '@/hooks/useIsMobile';
import { Campaign } from '@/types';
import { getFullUserData, userDateFormatString } from '@/util';
import dateFns from '@date-io/date-fns';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
  makeStyles,
} from '@material-ui/core';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import UserMultiselect from './UserMultiselect';

const useStyles = makeStyles({
  paper: {
    width: '500px',
  },
});

export type CampaignDialogProps = Omit<DialogProps, 'onClose'> & {
  campaign?: Campaign | null;
  isLoading?: boolean;
  onSave: (newCampaign: Campaign) => void;
  onClose: () => void;
};

const CampaignDialog: React.FC<CampaignDialogProps> = ({
  campaign,
  isLoading,
  onSave,
  onClose,
  ...dialogProps
}) => {
  const isMobile = useIsMobile();
  const classes = useStyles();
  const { t } = useTranslation();
  const [newCampaign, setNewCampaign] = useState(campaign || ({} as Campaign));
  const [noName, setNoName] = useState(false);

  const handleSave = () => {
    if (!newCampaign.name) {
      setNoName(true);
      return;
    }
    setNoName(false);
    onSave(newCampaign);
  };

  const handleChange = (changed: Partial<Campaign>) => {
    const result = {
      ...newCampaign,
      ...changed,
    };
    if (result.name) {
      setNoName(false);
    }
    setNewCampaign(result);
  };

  return (
    <MuiPickersUtilsProvider utils={dateFns}>
      <Dialog classes={classes} {...dialogProps} onClose={onClose}>
        <DialogTitle>
          {!campaign
            ? t('new_campaign')
            : t('edit_campaign', { name: campaign.name })}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column">
            <TextField
              required
              error={noName}
              label={t('name')}
              value={newCampaign.name ?? campaign?.name}
              onChange={({ target: { value } }) =>
                handleChange({ name: value })
              }
            />
            <TextField
              multiline
              id="campaign-description"
              label={t('description')}
              value={newCampaign.description ?? campaign?.description}
              onChange={({ target: { value } }) =>
                handleChange({ description: value })
              }
            />
            <Box display="flex">
              <KeyboardDatePicker
                autoOk
                disableToolbar
                variant={isMobile ? 'dialog' : 'inline'}
                format={userDateFormatString}
                id="campaign-start-date"
                label={t('start_date')}
                value={newCampaign.startDate ?? campaign?.startDate ?? null}
                onChange={(startDate) => handleChange({ startDate })}
              />
              <Box ml={2} />
              <KeyboardDatePicker
                autoOk
                disableToolbar
                variant={isMobile ? 'dialog' : 'inline'}
                format={userDateFormatString}
                id="campaign-end-date"
                label={t('end_date')}
                value={newCampaign.endDate ?? campaign?.endDate ?? null}
                onChange={(endDate) => handleChange({ endDate })}
              />
              <Box ml={2} />
              <TextField
                id="campaign-tweet-count"
                label={t('tweet_count')}
                type="number"
                value={newCampaign.tweetCount ?? campaign?.tweetCount}
                onChange={({ target: { value } }) =>
                  handleChange({ tweetCount: parseInt(value) })
                }
              />
            </Box>
            <UserMultiselect
              label={t('add_promoters')}
              users={campaign?.influencers?.map(
                (u) => getFullUserData(u, campaign.users)!
              )}
              onUsersSelected={(influencers) => handleChange({ influencers })}
            />
            <UserMultiselect
              label={t('add_managers')}
              users={campaign?.managers?.map(
                (u) => getFullUserData(u, campaign.users)!
              )}
              onUsersSelected={(managers) => handleChange({ managers })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={isLoading}
            aria-label={t('save')}
          >
            {isLoading ? <CircularProgress /> : t('save')}
          </Button>
          <Button onClick={onClose} aria-label={t('cancel')}>
            {t('cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </MuiPickersUtilsProvider>
  );
};

export default CampaignDialog;
