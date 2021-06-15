import { useEffect, useState } from 'react';

export const useIsInitialized = (val: any) => {
  const [isInit, setIsInit] = useState(!!val);

  useEffect(() => setIsInit(isInit || !!val));

  return isInit;
};
