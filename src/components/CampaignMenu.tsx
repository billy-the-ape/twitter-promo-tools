import { useIsMobile } from '@/hooks/useIsMobile';
import { Campaign } from '@/types';
import { stopPropagationCallback } from '@/util';
import {
  Box,
  IconButton,
  ListItemIcon,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import TwitterIcon from '@material-ui/icons/Twitter';
import ShowIcon from '@material-ui/icons/Visibility';
import HideIcon from '@material-ui/icons/VisibilityOff';
import { useTranslation } from 'react-i18next';

import Menu from './MenuWithTrigger';
import { patchHideCampaigns, patchUnhideCampaigns } from './util/fetch';

const useStyles = makeStyles(({ palette }) => ({
  forceRegularColor: {
    color: `${palette.text.primary} !important`,
  },
}));

export type CampaignMenuProps = {
  campaign: Campaign;
  onSubmitTweet?: () => void;
  onEditCampaign?: () => void;
  onDeleteCampaign?: () => void;
  mutate: () => void;
  showMobileIcons?: boolean;
  noEdit?: boolean;
};

const CampaignMenu: React.FC<CampaignMenuProps> = ({
  campaign,
  onSubmitTweet,
  onEditCampaign,
  onDeleteCampaign,
  mutate,
  showMobileIcons,
  noEdit,
}) => {
  const { t } = useTranslation();
  const isSm = useIsMobile({ breakpoint: 'sm' });
  const classes = useStyles();

  const handleToggleHideCampaign = async () => {
    if (!campaign.hidden) {
      await patchHideCampaigns([String(campaign._id)]);
      mutate();
    } else {
      await patchUnhideCampaigns([String(campaign._id)]);
      mutate();
    }
  };

  const {
    influencer: isInfluencer = false,
    manager: isManager = false,
    owner: isOwner = false,
  } = campaign.permissions ?? {};

  const hideString: string = campaign.hidden
    ? t('unhide_campaign')
    : t('hide_campaign');

  return isSm && !showMobileIcons ? (
    <Menu id={`menu-${campaign._id}`}>
      {campaign.externalLink && (
        <Menu.Item
          onClick={stopPropagationCallback(() =>
            window.open(campaign.externalLink)
          )}
        >
          <ListItemIcon>
            <OpenInNewIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">{t('open_external_link')}</Typography>
        </Menu.Item>
      )}
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
      <Menu.Item onClick={stopPropagationCallback(handleToggleHideCampaign)}>
        <ListItemIcon>
          {campaign.hidden ? (
            <ShowIcon fontSize="small" />
          ) : (
            <HideIcon fontSize="small" />
          )}
        </ListItemIcon>
        <Typography variant="inherit">{hideString}</Typography>
      </Menu.Item>
    </Menu>
  ) : (
    <Box display="flex">
      {campaign.externalLink && (
        <Tooltip title={campaign.externalLink}>
          <IconButton
            className={classes.forceRegularColor}
            href={campaign.externalLink}
            target="_blank"
            onClick={stopPropagationCallback()}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onSubmitTweet && isInfluencer && (
        <Tooltip title={t('submit_tweet') as string}>
          <IconButton onClick={stopPropagationCallback(onSubmitTweet)}>
            <TwitterIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={hideString}>
        <IconButton onClick={stopPropagationCallback(handleToggleHideCampaign)}>
          {campaign.hidden ? (
            <ShowIcon fontSize="small" />
          ) : (
            <HideIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      {!noEdit && (isManager || isOwner) && (
        <Menu id={`menu-${campaign._id}`}>
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
      )}
    </Box>
  );
};

export default CampaignMenu;
