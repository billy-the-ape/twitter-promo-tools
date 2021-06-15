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
  onConfirm: () => Promise<any> | void;
  onClose: () => void;
  description?: string;
  confirmText?: string;
  isLoading?: boolean;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  description,
  confirmText,
  isLoading,
  onConfirm,
  onClose,
  ...rest
}) => {
  const { t } = useTranslation();
  return (
    <Dialog {...rest} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          {description || t('cannot_be_undone_confirm')}
        </Typography>
      </DialogContent>
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
          {isLoading ? <CircularProgress /> : confirmText || t('confirm')}
        </Button>
        <Button onClick={onClose}>{t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};
export default ConfirmDialog;
