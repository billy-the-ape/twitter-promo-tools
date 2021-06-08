import { AppBar, Box, Hidden, IconButton, Toolbar, Typography } from '@material-ui/core';
import Link from 'next/link';
import TwitterIcon from '@material-ui/icons/Twitter';
import SignIn from './SignIn';

const Header: React.FC = () => (
  <AppBar>
    <Toolbar>
      <Link href="/">
        <IconButton edge="start">
          <TwitterIcon />
        </IconButton>
      </Link>
      <Box flex="1">
        <Typography variant="h6">
          <Hidden xsDown>
            Twitter Promotional Tools
          </Hidden>
          <Hidden smUp>
            Twitter Promo Tools
          </Hidden>
        </Typography>
      </Box>
      <SignIn />
    </Toolbar>
  </AppBar>
);

export default Header;
