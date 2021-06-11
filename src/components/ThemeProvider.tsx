import { useSharedState } from '@/hooks/useSharedState';
import {
  ThemeProvider as MuiThemeProvider,
  ThemeOptions,
  createMuiTheme,
} from '@material-ui/core';

const sharedTheme: ThemeOptions = {
  overrides: {
    MuiTextField: {
      root: {
        marginTop: 8,
        width: '100%',
      },
    },
    MuiDivider: {
      root: {
        margin: '16px 0',
      },
      vertical: {
        margin: '0 8px',
        minHeight: '40px',
        maxHeight: '100%',
      },
    },
    MuiAvatar: {
      root: {
        width: 32,
        height: 32,
        fontSize: '12px',
        '&:last-child': {
          marginRight: '8px',
        },
      },
    },
  },
};

const darkTheme: ThemeOptions = {
  ...sharedTheme,
  palette: {
    type: 'dark',
    primary: { main: '#3399ff' },
  },
  overrides: {
    ...sharedTheme.overrides,
    MuiButton: {
      contained: {
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  },
};
const lightTheme: ThemeOptions = {
  ...sharedTheme,
  palette: {
    type: 'light',
    background: { default: '#ccc' },
  },
};

const ThemeProvider: React.FC = ({ children }) => {
  const [darkMode = true] = useSharedState('darkMode');

  const appliedTheme = createMuiTheme({
    ...sharedTheme,
    ...(darkMode ? darkTheme : lightTheme),
  });

  return <MuiThemeProvider theme={appliedTheme}>{children}</MuiThemeProvider>;
};

export default ThemeProvider;
