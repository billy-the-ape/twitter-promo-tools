import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Typography,
} from '@material-ui/core';
import { ReactNode } from 'react';

export type ConfirmDialogProps = Omit<DialogProps, 'onClose'> & {
  title: ReactNode;
  onConfirm: () => Promise<any>;
  onClose: () => void;
  subText?: string;
  confirmText?: string;
  isLoading?: boolean;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  subText,
  confirmText = 'Save',
  isLoading,
  onConfirm,
  onClose,
  ...rest
}) => (
  <Dialog {...rest} onClose={onClose}>
    <DialogTitle>
      {title}
    </DialogTitle>
    {subText && (
      <DialogContent>
        <Typography variant="body1">
          {subText}
        </Typography>
      </DialogContent>
    )}
    <DialogActions>
      <Button variant="contained" color="primary" onClick={async () => {
        await onConfirm();
        onClose();
      }} disabled={isLoading}>
        {isLoading ? <CircularProgress /> : "Confirm"}
      </Button>
      <Button onClick={onClose}>Cancel</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;