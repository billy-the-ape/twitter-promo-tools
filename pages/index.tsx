import { CssBaseline } from '@material-ui/core';
import Head from 'next/head'
import Header from '../components/Header';

const Home: React.FC = () => (
  <div>
    <CssBaseline />
    <Head>
      <title>Twitter Promo Tools</title>
      <meta name="description" content="Tools for Twitter promoters and managers." />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header />
  </div>
);

export default Home;