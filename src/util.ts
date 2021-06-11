import { TwitterUser, User } from '@/types';

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
