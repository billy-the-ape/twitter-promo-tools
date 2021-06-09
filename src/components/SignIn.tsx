import {
  useSession, signIn, signOut
} from 'next-auth/client'
import { Button, CircularProgress, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(({ spacing }) => ({
  img: {
    marginRight: spacing(1),
    border: '1px solid black',
    height: 20,
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
        {session.user.image && <img className={classes.img} src={session.user.image} />}
        Sign out
      </Button>
    )
  }
  return <Button variant="contained" onClick={() => signIn('twitter')}>Sign in</Button>
};

export default SignIn;