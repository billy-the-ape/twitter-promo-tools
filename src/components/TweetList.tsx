import { useIsMobile } from '@/hooks/useIsMobile';
import { SubmittedTweet, User } from '@/types';
import { formatDate } from '@/util';
import {
  Avatar,
  Box,
  Hidden,
  IconButton,
  Link,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ConfirmDialog = dynamic(() => import('./ConfirmDialog'), { ssr: false });

export type TweetListProps = {
  tweets: SubmittedTweet[];
  users: User[];
  campaignName: string;
  onDelete: (id: string) => void;
};

const useStyles = makeStyles(({ spacing, breakpoints }) => ({
  linkAvatar: {
    height: spacing(3),
    width: spacing(3),
    marginRight: spacing(1),
  },
  linkBox: {
    [breakpoints.down('sm')]: {
      justifyContent: 'space-around',
    },
  },
}));

const TweetList: React.FC<TweetListProps> = ({
  tweets,
  users,
  campaignName,
  onDelete,
}) => {
  const classes = useStyles();
  const [deleteObj, setDeleteObj] = useState<
    { id: string; screenName?: string } | undefined
  >();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  if (!tweets.length) {
    return <></>;
  }
  return (
    <>
      <Box mt={2} display="flex" flexDirection="column">
        {tweets.map(({ id, authorId, createdAt }) => {
          const { screenName, image } =
            users.find(({ id }) => id === authorId) || {};
          const link = `twitter.com/${screenName}/status/${id}`;
          return (
            <Box
              key={id}
              className={classes.linkBox}
              display="flex"
              alignItems="center"
            >
              <Avatar className={classes.linkAvatar} src={image!}>
                {screenName?.substr(0, 1).toLocaleUpperCase()}
              </Avatar>
              <Link href={`https://${link}`} target="_blank">
                <Typography variant="inherit">
                  {isMobile ? `...${link.substring(20)}` : link}
                </Typography>
              </Link>
              <Typography variant="body2">
                <Hidden smDown>&nbsp;-&nbsp;</Hidden>
                {formatDate(createdAt)}
              </Typography>
              <Box ml={2}>
                <Tooltip title={t('delete_tweet') as string}>
                  <IconButton
                    onClick={() => setDeleteObj({ id, screenName })}
                    size="small"
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          );
        })}
      </Box>
      {deleteObj && (
        <ConfirmDialog
          open
          title={t('delete_tweet')}
          description={t('delete_tweet_description', {
            screenName: deleteObj.screenName,
            campaignName,
          })}
          onConfirm={() => onDelete(deleteObj.id)}
          onClose={() => setDeleteObj(undefined)}
        />
      )}
    </>
  );
};

export default TweetList;
