import Head from 'next/head'
import Image from 'next/image'

import SignIn from '../components/SignIn';

import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Twitter Promo Tools</title>
        <meta name="description" content="Tools for Twitter promoters and managers." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SignIn />
    </div>
  )
}
