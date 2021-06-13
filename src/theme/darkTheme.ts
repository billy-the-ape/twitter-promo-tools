import { ThemeOptions } from '@material-ui/core';

import sharedTheme from './sharedTheme';

const DARK_PRIMARY_COLOR = '#3399ff';
const darkTheme: ThemeOptions = {
  ...sharedTheme,
  palette: {
    type: 'dark',
    primary: { main: DARK_PRIMARY_COLOR },
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
    MuiCssBaseline: {
      '@global': {
        ':root': {
          colorScheme: 'dark',
        },
        a: {
          cursor: 'pointer',
          color: DARK_PRIMARY_COLOR,
          textDecoration: 'none',
          '&:visited': {
            color: DARK_PRIMARY_COLOR,
          },
          '&:hover': {
            textDecoration: 'underline',
            opacity: '.9',
          },
        },
      },
    },
  },
};

export default darkTheme;
