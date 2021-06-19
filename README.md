This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, you will need to create a developer account with twitter. You will need to create a project and get the api key, secret and bearer token. Copy the file `.env.example` in this repo and rename it to `.env.local` and add those keys to the `TWITTER_ID` `TWITTER_SECRET` and `TWITTER_BEARER` keys there.

Once you have created the project, you will also need to add your development environment to the projects "Callback Urls" in the "Authentication Settings" section. This example uses the following `http://127.0.0.1:3000/api/auth/callback/twitter` - If your network address is different than `127.0.0.1` you should change that to what yours is. Twitter api does not allow `localhost` to be used for development.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://127.0.0.1:3000/](http://127.0.0.1:3000/) with your browser to see the result. _Note: if your network address is different above, use that address here._

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
