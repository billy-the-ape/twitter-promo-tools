import { Campaign, TwitterUser, User, UserBase } from '@/types';

export const fetchJson = <
  TResponse extends Record<string, any> | Record<string, any>[]
>(
  input: RequestInfo,
  init?: RequestInit
) => fetch(input, init).then((res) => res.json() as Promise<TResponse>);

export const noop = () => {};

export const mapTwitterToUsers = (twitterUsers: TwitterUser[]): User[] =>
  twitterUsers.map(
    ({ username: screenName, profile_image_url: image, ...rest }) => ({
      ...rest,
      screenName,
      image,
    })
  );

export const isServer = typeof window === 'undefined';

export const userDateFormatString = (() => {
  if (isServer) {
    return 'MM/dd/yyyy';
  }

  const formatObj = new Intl.DateTimeFormat(
    window.navigator.language
  ).formatToParts(new Date());

  return formatObj
    .map((obj) => {
      switch (obj.type) {
        case 'day':
          return 'dd';
        case 'month':
          return 'MM';
        case 'year':
          return 'yyyy';
        default:
          return obj.value;
      }
    })
    .join('');
})();

export const getColorFromValue = (value: number) => {
  //value from 0 to 1
  var hue = ((1 - value) * 120).toString(10);
  return `hsl(${hue},100%,50%)`;
};

export const formatDateSince = (date?: Date | string | null) => {
  if (!date) {
    return '';
  }
  const diff = new Date(date).getTime() - Date.now();
  const min = 1000 * 60;
  const hour = min * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = week * 4;
  const year = month * 12;

  const rtf1 = new Intl.RelativeTimeFormat(window.navigator.language);
  const absDiff = Math.abs(diff);

  if (absDiff > year) {
    return rtf1.format(Math.ceil(diff / year), 'year');
    // just days
  } else if (absDiff > month) {
    return rtf1.format(Math.ceil(diff / month), 'month');
    // just days
  } else if (absDiff > week) {
    return rtf1.format(Math.ceil(diff / week), 'week');
    // just days
  } else if (absDiff > day) {
    return rtf1.format(Math.ceil(diff / day), 'day');
    // days + hours
  } else if (absDiff > hour) {
    // hours
    return rtf1.format(Math.ceil(diff / hour), 'hour');
  } else if (absDiff > min) {
    // mins
    return rtf1.format(Math.ceil(diff / min), 'minute');
  } else {
    // secs
    return rtf1.format(Math.ceil(diff / 1000), 'second');
  }
};

export const formatDate = (
  date?: Date | string | null,
  unknownString: string = 'Unknown'
): string => {
  if (isServer) {
    return '';
  }
  if (!date) {
    return unknownString;
  }

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'numeric',
    year: undefined,
  };

  return new Intl.DateTimeFormat(window.navigator.language, options).format(
    new Date(date)
  );
};

export const getFullUserData = ({ id: findId }: UserBase, users?: User[]) =>
  users?.find(({ id }) => id === findId);

export const fetchTwitterApi = async <
  TResponse extends Record<string, any> | Record<string, any>[] = Record<
    string,
    any
  >[]
>(
  url: string,
  defaultData?: TResponse
): Promise<TResponse> => {
  const { data = defaultData } = await fetchJson(
    `https://api.twitter.com/2${url}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER}`,
      },
    }
  );
  return data as TResponse;
};

// STAY GREEN UNTIL THIS TIME IS UP
const TWEET_COOLDOWN = 60000 * 60 * 12; // 12 hours
// LOWER THAN THIS VALUE MEANS GREEN
const GREEN_PCT = 0.33;

/* This complex beast basically has the following logic:
 *  - If user tweeted for this campaign in the last 12 hours, the color should be
      green no matter what.
 *  - If past 12 hours, this should become progressively higher 
*/
export const calculatePercentOff = ({
  datePercentage,
  tweetPercentage,
  userTweets,
}: Campaign) => {
  let maxValue = 1;
  if (userTweets.length) {
    const sortedTweets = [...userTweets].sort(
      ({ createdAt: a }, { createdAt: b }) =>
        new Date(b).getTime() - new Date(a).getTime()
    );
    const lastTweetDate = new Date(sortedTweets[0].createdAt).getTime();
    const diff = Date.now() - lastTweetDate;
    if (diff < TWEET_COOLDOWN) {
      maxValue = (diff / TWEET_COOLDOWN) * GREEN_PCT;
    }
  }

  return Math.min(
    Math.max(
      (datePercentage ?? 0) -
        (tweetPercentage ?? 0) +
        0.4 + // Magic number
        // Add .33 to start in the yellow when no tweets
        (userTweets.length === 0 ? GREEN_PCT : 0),
      0
    ),
    maxValue
  );
};
