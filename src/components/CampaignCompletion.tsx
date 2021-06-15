import {
  Box,
  LinearProgress,
  Paper,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(({ breakpoints, spacing }) => ({
  completionRoot: {
    marginTop: spacing(2),
  },
  title: {
    width: '160px',
    textAlign: 'right',
  },
  linearProgress: {
    flex: 1,
    maxWidth: '100%',
    [breakpoints.up('md')]: {
      marginRight: spacing(5),
    },
  },
  percentageValue: {
    minWidth: '100px',
    textAlign: 'center',
  },
}));

export type CampaignCompletionProps = {
  title: ReactNode;
  tweetPercentage?: number;
  datePercentage?: number;
};

const CampaignCompletion: React.FC<CampaignCompletionProps> = ({
  title,
  tweetPercentage,
  datePercentage,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const tweetPercentageValue = (tweetPercentage ?? 0) * 100;
  const datePercentageValue = (datePercentage ?? 0) * 100;

  return (
    <Paper className={classes.completionRoot}>
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        pb={2}
        pt={2}
        pl={4}
        pr={4}
      >
        <Typography variant="body1">{title}</Typography>
        <Box display="flex" alignItems="center" width="100%">
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
              <Typography className={classes.title}>
                {t('time_passed')}
              </Typography>
              <Typography className={classes.percentageValue} variant="caption">
                {Math.round(datePercentageValue)}%
              </Typography>
              <LinearProgress
                className={classes.linearProgress}
                variant="determinate"
                value={datePercentageValue}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default CampaignCompletion;
