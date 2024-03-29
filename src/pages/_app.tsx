import ThemeProvider from '@/components/ThemeProvider';
import { Provider as AuthProvider } from 'next-auth/client';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { SnackbarProvider, SnackbarProviderProps } from 'notistack';

const SNACKBAR_DEFAULTS: Omit<SnackbarProviderProps, 'children'> = {
  maxSnack: 2,
  anchorOrigin: {
    horizontal: 'right',
    vertical: 'top',
  },
  autoHideDuration: 3000,
};

const App: React.FC<AppProps> = ({ Component, pageProps }) => (
  <AuthProvider session={pageProps.session}>
    <ThemeProvider>
      <SnackbarProvider {...SNACKBAR_DEFAULTS}>
        <Component {...pageProps} />
      </SnackbarProvider>
    </ThemeProvider>
  </AuthProvider>
);

export default appWithTranslation(App);
