import { useSubmitTweets } from '@/hooks/useSubmitTweets';
import {
  Button,
  IconButton,
  TextField,
  Tooltip,
  makeStyles,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CancelIcon from '@material-ui/icons/Cancel';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type CampaignTweetInputProps = {
  className?: string;
  onCancel: () => void;
  campaignId: string;
  mutate: () => void;
};

const useStyles = makeStyles(({ spacing, breakpoints }) => ({
  submitButton: {
    height: '100%',
    marginRight: '-14px',
    zIndex: 1,
    borderRadius: '4px',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    padding: '7px 16px',
  },
}));

const CampaignTweetInput: React.FC<CampaignTweetInputProps> = ({
  className,
  onCancel,
  campaignId,
  mutate,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isError, setIsError] = useState(false);

  const { tweetLink, setTweetLink, submitTweets } = useSubmitTweets({
    setIsError,
    onCancel,
    mutate,
    campaignId,
  });

  return (
    <>
      <Tooltip title={t('tweet_submit_explanation') as string}>
        <TextField
          className={className}
          label={t('submit_tweet_full')}
          autoFocus
          error={isError}
          variant="outlined"
          value={tweetLink}
          size="small"
          onClick={(e) => e.stopPropagation()}
          onChange={({ target: { value } }) => setTweetLink(value)}
          InputProps={{
            endAdornment: (
              <Button
                className={classes.submitButton}
                variant="contained"
                color="primary"
                disabled={!tweetLink}
                onClick={submitTweets}
              >
                <AddIcon />
              </Button>
            ),
          }}
        />
      </Tooltip>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onCancel();
        }}
      >
        <CancelIcon />
      </IconButton>
    </>
  );
};

export default CampaignTweetInput;
