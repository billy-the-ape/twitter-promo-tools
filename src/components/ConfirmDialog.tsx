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
import { useTranslation } from 'react-i18next';

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
}) => {
  const { t } = useTranslation();
  return (
    <Dialog {...rest} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      {subText && (
        <DialogContent>
          <Typography variant="body1">{subText}</Typography>
        </DialogContent>
      )}
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={async () => {
            await onConfirm();
            onClose();
          }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress /> : t('confirm')}
        </Button>
        <Button onClick={onClose}>{t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};
export default ConfirmDialog;
