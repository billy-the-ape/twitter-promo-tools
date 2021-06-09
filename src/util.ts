export const fetcher = <TResponse extends Record<string, any> | Record<string, any>[]>(
  input: RequestInfo, init?: RequestInit
) => fetch(input, init).then(res => res.json() as Promise<TResponse>);