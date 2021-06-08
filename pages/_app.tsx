import { Provider as AuthProvider } from 'next-auth/client';
import type { AppProps } from 'next/app'

import ThemeProvider from '../components/ThemeProvider';

const App: React.FC<AppProps> = ({ Component, pageProps }) => (
  <AuthProvider session={pageProps.session}>
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  </AuthProvider>
);

export default App;
