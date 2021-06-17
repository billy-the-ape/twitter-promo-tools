import { useIsMobile } from '@/hooks/useIsMobile';
import { Campaign } from '@/types';
import { stopPropagationCallback } from '@/util';
import {
  Box,
  IconButton,
  ListItemIcon,
  Tooltip,
  Typography,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import TwitterIcon from '@material-ui/icons/Twitter';
import { useTranslation } from 'react-i18next';

import Menu from './MenuWithTrigger';

export type CampaignMenuProps = {
  campaign: Campaign;
  onSubmitTweet?: () => void;
  onEditCampaign?: () => void;
  onDeleteCampaign?: () => void;
};

const CampaignMenu: React.FC<CampaignMenuProps> = ({
  campaign,
  onSubmitTweet,
  onEditCampaign,
  onDeleteCampaign,
}) => {
  const { t } = useTranslation();
  const isSm = useIsMobile({ breakpoint: 'sm' });

  const {
    influencer: isInfluencer = false,
    manager: isManager = false,
    owner: isOwner = false,
  } = campaign.permissions ?? {};

  return isSm ? (
    <Menu id={`menu-${campaign._id}`}>
      {onSubmitTweet && isInfluencer && (
        <Menu.Item onClick={stopPropagationCallback(onSubmitTweet)}>
          <ListItemIcon>
            <TwitterIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">{t('submit_tweet')}</Typography>
        </Menu.Item>
      )}
      {onEditCampaign && isManager && (
        <Menu.Item onClick={stopPropagationCallback(onEditCampaign)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">{t('edit')}</Typography>
        </Menu.Item>
      )}
      {onDeleteCampaign && isOwner && (
        <Menu.Item onClick={stopPropagationCallback(onDeleteCampaign)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">{t('delete')}</Typography>
        </Menu.Item>
      )}
    </Menu>
  ) : (
    <Box display="flex">
      {onSubmitTweet && isInfluencer && (
        <Tooltip title={t('submit_tweet') as string}>
          <IconButton onClick={stopPropagationCallback(onSubmitTweet)}>
            <TwitterIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onEditCampaign && isManager && (
        <Tooltip title={t('edit') as string}>
          <IconButton onClick={stopPropagationCallback(onEditCampaign)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onDeleteCampaign && isOwner && (
        <Tooltip title={t('delete') as string}>
          <IconButton onClick={stopPropagationCallback(onDeleteCampaign)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default CampaignMenu;
