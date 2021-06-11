import { Box, Container, CssBaseline } from '@material-ui/core';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { TRANSLATION_NAMESPACE } from '@/constants';
import CampaignList from '@/components/CampaignList';
import Header from '@/components/Header';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';
import TodoList from '@/components/TodoList';

const Home: React.FC = () => {
  const isLoggedIn = useIsLoggedIn();
  const { t } = useTranslation();
  return (
    <div>
      <CssBaseline />
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content={t('meta_description')} />
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
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [TRANSLATION_NAMESPACE])),
      // Will be passed to the page component as props
    },
  };
}

export default Home;
