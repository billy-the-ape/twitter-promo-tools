import {
  AppBar,
  Box,
  Hidden,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';
import DarkModeIcon from '@material-ui/icons/Brightness6';
import Link from 'next/link';
import TwitterIcon from '@material-ui/icons/Twitter';
import { useTranslation } from 'next-i18next';

import SignIn from './SignIn';
import { useSharedState } from '@/hooks/useSharedState';

const Header: React.FC = () => {
  const [darkMode = true, setDarkMode] = useSharedState('darkMode');
  console.log({ darkMode });
  const headerIconColor = darkMode ? 'rgba(0, 0, 0, 0.87)' : 'white';
  const { t } = useTranslation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Link href="/">
          <IconButton aria-label={t('home')} edge="start">
            <TwitterIcon htmlColor={headerIconColor} />
          </IconButton>
        </Link>
        <Box flex="1">
          <Typography variant="h5">
            <Hidden xsDown>{t('title')}</Hidden>
            <Hidden smUp>{t('title_mobile')}</Hidden>
          </Typography>
        </Box>
        <SignIn />
        <Box ml={2}>
          <Tooltip title={String(t('dark_mode'))}>
            <IconButton
              aria-label={t('dark_mode')}
              onClick={() => setDarkMode(!darkMode)}
            >
              <DarkModeIcon htmlColor={headerIconColor} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default Header;
