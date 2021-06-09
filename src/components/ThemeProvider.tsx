
import { createMuiTheme, ThemeProvider as MuiThemeProvider, ThemeOptions } from '@material-ui/core';
import { useSharedState } from '@/hooks/useSharedState';


const darkTheme: ThemeOptions = { palette: { type: 'dark' } };
const lightTheme: ThemeOptions = { palette: { type: 'light' } };

const ThemeProvider: React.FC = ({ children }) => {
  const [darkMode = true] = useSharedState('darkMode');

  const appliedTheme = createMuiTheme(darkMode ? darkTheme : lightTheme);

  return (
    <MuiThemeProvider theme={appliedTheme}>{children}</MuiThemeProvider>
  )
};

export default ThemeProvider;