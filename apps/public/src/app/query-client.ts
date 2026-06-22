import { QueryClient } from '@tanstack/react-query'

/**
 * Shared TanStack Query client. Auth/session queries opt out of retries so a
 * 401 surfaces immediately instead of being retried.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
    },
  })
}
