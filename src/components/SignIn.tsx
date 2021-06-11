import { Button, CircularProgress, makeStyles } from '@material-ui/core';
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
        {t('sign_out')}
      </Button>
    );
  }
  return (
    <Button variant="contained" onClick={() => signIn('twitter')}>
      {t('sign_in')}
    </Button>
  );
};

export default SignIn;
