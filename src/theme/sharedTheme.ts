import { ThemeOptions } from '@material-ui/core';

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

export default sharedTheme;
