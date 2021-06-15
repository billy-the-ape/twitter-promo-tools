import { SubmittedTweet, User, UserBase } from '@/types';
import {
  calculatePercentOff,
  getColorFromValue,
  getFullUserData,
} from '@/util';
import { Grid, GridProps } from '@material-ui/core';

import UserChip from './UserChip';

export type UserChipGridProps = GridProps & {
  users: UserBase[];
  fullUserList: User[];
  userSubMap: Record<string, SubmittedTweet[]>;
  datePercentage?: number;
  requiredTweetCount?: number;
};

const UserChipGrid: React.FC<UserChipGridProps> = ({
  children,
  users,
  fullUserList,
  userSubMap,
  datePercentage,
  requiredTweetCount,
  ...gridProps
}) => {
  return (
    <Grid spacing={1} {...gridProps} container>
      {children && <Grid item>{children}</Grid>}
      {users.map((u) => {
        const { id, screenName, image } =
          getFullUserData(u, fullUserList) ?? {};

        const userTweets = userSubMap[id!] || [];
        const tweetCount = userTweets.length || 0;

        const percentOff =
          !!datePercentage && !!requiredTweetCount
            ? calculatePercentOff({
                tweetPercentage: tweetCount / requiredTweetCount,
                userTweets,
                datePercentage,
              })
            : 0;

        const style =
          percentOff > 0
            ? { border: `1px solid ${getColorFromValue(percentOff)}` }
            : undefined;

        return (
          <Grid item key={id}>
            <UserChip
              style={style}
              image={image!}
              screenName={screenName!}
              tweetCount={tweetCount}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default UserChipGrid;
