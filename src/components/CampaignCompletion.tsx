import {
  Box,
  LinearProgress,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(({ spacing }) => ({
  title: {
    width: '160px',
    textAlign: 'right',
  },
  linearProgress: {
    flex: 1,
    marginRight: spacing(5),
    maxWidth: '100%',
    minWidth: '200px',
    width: '390px',
  },
  percentageValue: {
    minWidth: '100px',
    textAlign: 'center',
  },
}));

export type CampaignCompletionProps = {
  tweetPercentage?: number;
  datePercentage?: number;
};

const CampaignCompletion: React.FC<CampaignCompletionProps> = ({
  tweetPercentage,
  datePercentage,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const tweetPercentageValue = (tweetPercentage ?? 0) * 100;
  const datePercentageValue = (datePercentage ?? 0) * 100;

  const color =
    tweetPercentageValue > datePercentageValue ? 'primary' : 'secondary';

  return (
    <Box width="100%" display="flex" alignItems="center" pl={4} pr={4}>
      <Tooltip title={t('completion_explanation') as string}>
        <InfoIcon />
      </Tooltip>
      <Box flex="1">
        <Box
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography className={classes.title}>
            {t('tweets_completed')}
          </Typography>
          <Typography className={classes.percentageValue} variant="caption">
            {Math.round(tweetPercentageValue)}%
          </Typography>
          <LinearProgress
            color={color}
            className={classes.linearProgress}
            variant="determinate"
            value={tweetPercentageValue}
          />
        </Box>
        <Box
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography className={classes.title}>{t('time_passed')}</Typography>
          <Typography className={classes.percentageValue} variant="caption">
            {Math.round(datePercentageValue)}%
          </Typography>
          <LinearProgress
            color={color}
            className={classes.linearProgress}
            variant="determinate"
            value={datePercentageValue}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CampaignCompletion;
