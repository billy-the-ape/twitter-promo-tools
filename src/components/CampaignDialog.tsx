import {
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import { useState } from 'react';
import { Campaign } from '@/types';

export type CampaignDialogProps = Omit<DialogProps, 'onClose'> & {
  campaign?: Campaign;
  isLoading?: boolean;
  onSave: (newCampaign: Campaign) => void;
  onClose: () => void;
}

const CampaignDialog: React.FC<CampaignDialogProps> = ({
  campaign,
  isLoading,
  onSave,
  onClose,
  ...dialogProps
}) => {
  const [newCampaign, setNewCampaign] = useState(campaign || {} as Campaign);
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
    }
    if (result.name) {
      setNoName(false);
    };
    setNewCampaign(result);
  };

  return (
    <Dialog {...dialogProps} onClose={onClose}>
      <DialogTitle>{!campaign ? 'New campaign' : `Edit ${campaign.name}`}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <TextField
            required
            error={noName}
            label="Name"
            value={campaign?.name}
            onChange={({ target: { value } }) => handleChange({ name: value })}
          />
          <TextField
            multiline
            label="Description"
            value={campaign?.description}
            onChange={({ target: { value } }) => handleChange({ description: value })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <CircularProgress /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CampaignDialog;