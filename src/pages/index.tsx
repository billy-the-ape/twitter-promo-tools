import { Box, Container, CssBaseline } from '@material-ui/core';
import CampaignList from 'components/CampaignList';
import Head from 'next/head'
import Header from '@/components/Header';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';
import TodoList from '@/components/TodoList';


const Home: React.FC = () => {
  const isLoggedIn = useIsLoggedIn();
  return (
    <div>
      <CssBaseline />
      <Head>
        <title>Twitter Promo Tools</title>
        <meta name="description" content="Tools for Twitter promoters and managers." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      {isLoggedIn && (
        <Container>
          <Box pt={5}>
            <TodoList />
            <CampaignList />
          </Box>
        </Container>
      )}
    </div>
  );
}
export default Home;