import {
  useSession, signIn, signOut
} from 'next-auth/client'
import { Button, CircularProgress, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(({ spacing }) => ({
  img: {
    marginRight: spacing(1)
  }
}));

const SignIn: React.FC = () => {
  const [session, loading] = useSession()
  const classes = useStyles();

  if (loading) {
    return <CircularProgress color="secondary" />
  }

  if (session && session.user) {
    return (
      <Button variant="contained" onClick={() => signOut()}>
        {session.user.image && <img className={classes.img} width={20} height={20} src={session.user.image} />}
        Sign out
      </Button>
    )
  }
  return <Button variant="contained" onClick={() => signIn('twitter')}>Sign in</Button>
};

export default SignIn;