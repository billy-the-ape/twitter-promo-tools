import {
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  makeStyles,
  TextField,
  Divider,
} from '@material-ui/core';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import dateFns from '@date-io/date-fns';
import { useState } from 'react';

import { Campaign } from '@/types';
import { useIsMobile } from '@/hooks/useIsMobile';
import { userDateFormatString } from '@/util';

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
    console.log('handleChange', { changed });
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
          {!campaign ? 'New campaign' : `Edit ${campaign.name}`}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column">
            <TextField
              required
              error={noName}
              label="Name"
              value={newCampaign.name ?? campaign?.name}
              onChange={({ target: { value } }) =>
                handleChange({ name: value })
              }
            />
            <TextField
              multiline
              id="campaign-description"
              label="Description"
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
                label="Start Date"
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
                label="End Date"
                value={newCampaign.endDate ?? campaign?.endDate ?? null}
                onChange={(endDate) => handleChange({ endDate })}
              />
              <Box ml={2} />
              <TextField
                id="campaign-tweet-count"
                label="Tweet Count"
                type="number"
                value={newCampaign.tweetCount ?? campaign?.tweetCount}
                onChange={({ target: { value } }) =>
                  handleChange({ tweetCount: parseInt(value) })
                }
              />
            </Box>
            <UserMultiselect
              label="Add Promoters by Twitter Handle"
              users={campaign?.influencers}
              onUsersSelected={(influencers) => handleChange({ influencers })}
            />
            <UserMultiselect
              label="Add Managers by Twitter Handle"
              users={campaign?.managers}
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
          >
            {isLoading ? <CircularProgress /> : 'Save'}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </MuiPickersUtilsProvider>
  );
};

export default CampaignDialog;
