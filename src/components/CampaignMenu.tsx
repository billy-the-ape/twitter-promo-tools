import { Campaign, CampaignPermissions } from '@/types';
import { ListItemIcon, Typography } from '@material-ui/core';
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
  return (
    <Menu id={`menu-${campaign._id}`}>
      {onSubmitTweet && campaign.permissions?.influencer && (
        <Menu.Item onClick={onSubmitTweet}>
          <ListItemIcon>
            <TwitterIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">{t('submit_tweet')}</Typography>
        </Menu.Item>
      )}
      {onEditCampaign && campaign.permissions?.manager && (
        <Menu.Item onClick={onEditCampaign}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">{t('edit')}</Typography>
        </Menu.Item>
      )}
      {onDeleteCampaign && campaign.permissions?.owner && (
        <Menu.Item onClick={onDeleteCampaign}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">{t('delete')}</Typography>
        </Menu.Item>
      )}
    </Menu>
  );
};

export default CampaignMenu;
