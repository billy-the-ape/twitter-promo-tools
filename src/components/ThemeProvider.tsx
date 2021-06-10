
import { createMuiTheme, ThemeProvider as MuiThemeProvider, ThemeOptions } from '@material-ui/core';
import { useSharedState } from '@/hooks/useSharedState';



const sharedTheme: ThemeOptions = {
  overrides: {
    MuiTextField: {
      root: {
        marginTop: 8,
        width: '100%',
      }
    },
    MuiDivider: {
      vertical: {
        margin: '0 8px',
      }
    },
    MuiAvatar: {
      root: {
        width: 32,
        height: 32,
        fontSize: '12px',
        '&:last-child': {
          marginRight: '8px',
        }
      }
    }
  }
}

const darkTheme: ThemeOptions = {
  ...sharedTheme,
  palette: {
    type: 'dark',
    primary: { main: '#3399ff' },

  },
};
const lightTheme: ThemeOptions = {
  ...sharedTheme,
  palette: {
    type: 'light',
    background: { default: '#ccc' },
  }
};

const ThemeProvider: React.FC = ({ children }) => {
  const [darkMode] = useSharedState('darkMode');

  const appliedTheme = createMuiTheme({ ...sharedTheme, ...(darkMode ? darkTheme : lightTheme) });

  return (
    <MuiThemeProvider theme={appliedTheme}>{children}</MuiThemeProvider>
  )
};

export default ThemeProvider;