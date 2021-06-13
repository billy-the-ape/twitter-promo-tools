import { useSharedState } from '@/hooks/useSharedState';
import darkTheme from '@/theme/darkTheme';
import lightTheme from '@/theme/lightTheme';
import {
  ThemeProvider as MuiThemeProvider,
  createMuiTheme,
} from '@material-ui/core';

const ThemeProvider: React.FC = ({ children }) => {
  const [darkMode = true] = useSharedState('darkMode');

  const appliedTheme = createMuiTheme(darkMode ? darkTheme : lightTheme);

  return <MuiThemeProvider theme={appliedTheme}>{children}</MuiThemeProvider>;
};

export default ThemeProvider;
