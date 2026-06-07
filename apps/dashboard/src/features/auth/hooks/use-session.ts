import { useQuery } from '@tanstack/react-query'

import { fetchSession } from '../api/auth-client'

const sessionQueryKey = ['auth', 'session'] as const

/** Query the current session via `GET /api/auth/me`. A 401 lands in `isError`. */
export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: fetchSession,
    retry: false,
  })
}
