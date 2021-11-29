import { Avatar, Chip, ChipProps, Link, makeStyles } from '@material-ui/core';

export type UserChipProps = ChipProps & {
  image: string;
  screenName: string;
  tweetCount?: number | string;
};

const useStyles = makeStyles(({ palette }) => ({
  link: {
    color: palette.text.secondary + ' !important',
  },
  pointer: {
    cursor: 'pointer',
  },
}));

const UserChip: React.FC<UserChipProps> = ({
  image,
  screenName,
  tweetCount,
  onClick,
  ...chipProps
}) => {
  const classes = useStyles();
  return (
    <Chip
      avatar={
        <Avatar src={image!}>
          {screenName?.substring(0, 1).toLocaleUpperCase()}
        </Avatar>
      }
      onClick={onClick}
      label={
        <>
          {onClick && screenName}
          {!onClick && (
            <Link
              className={classes.link}
              href={`https://twitter.com/${screenName}`}
              target="_blank"
            >
              {screenName! + (!!tweetCount ? ` (${tweetCount})` : '')}
            </Link>
          )}
        </>
      }
      {...chipProps}
    ></Chip>
  );
};
export default UserChip;
