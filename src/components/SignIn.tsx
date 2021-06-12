import { useIsMobile } from '@/hooks/useIsMobile';
import { Button, CircularProgress, makeStyles } from '@material-ui/core';
import SignOutIcon from '@material-ui/icons/ExitToApp';
import SignInIcon from '@material-ui/icons/MeetingRoom';
import { signIn, signOut, useSession } from 'next-auth/client';
import { useTranslation } from 'next-i18next';

const useStyles = makeStyles(({ spacing, palette }) => ({
  img: {
    marginRight: spacing(1),
    border: `1px solid ${palette.grey[500]}`,
    height: 20,
  },
}));

const SignIn: React.FC = () => {
  const [session, loading] = useSession();
  const isMobile = useIsMobile();
  const classes = useStyles();
  const { t } = useTranslation();

  if (loading) {
    return <CircularProgress color="secondary" />;
  }

  if (session && session.user) {
    return (
      <Button variant="contained" onClick={() => signOut()}>
        {session.user.image && (
          <img className={classes.img} src={session.user.image} />
        )}
        {!isMobile ? t('sign_out') : <SignOutIcon />}
      </Button>
    );
  }
  return (
    <Button variant="contained" onClick={() => signIn('twitter')}>
      {!isMobile ? t('sign_in') : <SignInIcon />}
    </Button>
  );
};

export default SignIn;
