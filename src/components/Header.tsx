import { AppBar, Box, Hidden, IconButton, Toolbar, Typography } from '@material-ui/core';

import DarkModeIcon from '@material-ui/icons/Brightness6';
import Link from 'next/link';
import TwitterIcon from '@material-ui/icons/Twitter';
import SignIn from './SignIn';
import { useSharedState } from '@/hooks/useSharedState';

const Header: React.FC = () => {
  const [darkMode, setDarkMode] = useSharedState('darkMode');
  const headerIconColor = darkMode ? 'rgba(0, 0, 0, 0.87)' : 'white';

  return (
    <AppBar position="static">
      <Toolbar>
        <Link href="/">
          <IconButton edge="start">
            <TwitterIcon htmlColor={headerIconColor} />
          </IconButton>
        </Link>
        <Box flex="1">
          <Typography variant="h5">
            <Hidden xsDown>
              Twitter Promo Tools
          </Hidden>
            <Hidden smUp>
              Promo Tools
          </Hidden>
          </Typography>
        </Box>
        <SignIn />
        <Box ml={2}>
          <IconButton onClick={() => setDarkMode(!darkMode)}>
            <DarkModeIcon htmlColor={headerIconColor} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default Header;
