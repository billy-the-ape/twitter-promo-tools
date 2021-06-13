import { User, UserBase } from '@/types';
import { getFullUserData } from '@/util';
import { Grid, GridProps } from '@material-ui/core';

import UserChip from './UserChip';

export type UserChipGridProps = GridProps & {
  users: UserBase[];
  fullUserList: User[];
  userSubCountMap: Record<string, number>;
};

const UserChipGrid: React.FC<UserChipGridProps> = ({
  children,
  users,
  fullUserList,
  userSubCountMap,
  ...gridProps
}) => {
  return (
    <Grid spacing={1} {...gridProps} container>
      {children && <Grid item>{children}</Grid>}
      {users.map((u) => {
        const { id, screenName, image } =
          getFullUserData(u, fullUserList) ?? {};

        const tweetCount = userSubCountMap[id!] || 0;
        return (
          <Grid item key={id}>
            <UserChip
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
