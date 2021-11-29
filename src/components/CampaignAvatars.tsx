import { Campaign } from '@/types';
import { getFullUserData } from '@/util';
import { Avatar, Tooltip, makeStyles } from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import clsx from 'clsx';
import { MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

export type CampaignAvatarProps = {
  campaign: Campaign;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  max?: number;
};

const useStyles = makeStyles({
  cursor: {
    cursor: 'pointer',
  },
});

const CampaignAvatars: React.FC<CampaignAvatarProps> = ({
  campaign,
  onClick,
  className,
  max = 5,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Tooltip title={t('expand_members') as string}>
      <AvatarGroup
        className={clsx(className, onClick && classes.cursor)}
        spacing="small"
        max={max}
        onClick={onClick}
      >
        {campaign.users?.map((u) => {
          const { screenName, image } =
            getFullUserData(u, campaign.users!) ?? {};
          return (
            <Avatar key={screenName} src={image!}>
              {screenName?.substring(0, 1).toLocaleUpperCase()}
            </Avatar>
          );
        })}
      </AvatarGroup>
    </Tooltip>
  );
};

export default CampaignAvatars;
