import { useSession } from 'next-auth/client';

export const useIsLoggedIn = () => {
  const [session] = useSession();
  return !!(session && session.user);
};
