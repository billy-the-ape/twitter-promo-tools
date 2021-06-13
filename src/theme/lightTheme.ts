import { ThemeOptions } from '@material-ui/core';

import sharedTheme from './sharedTheme';

const LIGHT_PRIMARY_COLOR = '#3f51b5';
const lightTheme: ThemeOptions = {
  ...sharedTheme,
  palette: {
    type: 'light',
    primary: { main: LIGHT_PRIMARY_COLOR },
    background: { default: '#ccc' },
  },
  overrides: {
    ...sharedTheme.overrides,
    MuiCssBaseline: {
      '@global': {
        a: {
          color: LIGHT_PRIMARY_COLOR,
          textDecoration: 'none',
          '&:visited': {
            color: LIGHT_PRIMARY_COLOR,
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

export default lightTheme;
