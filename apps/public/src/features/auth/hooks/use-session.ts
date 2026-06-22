import { useQuery } from '@tanstack/react-query'
import type { AuthMeResponse } from '@rpg/contracts'

import { fetchSession } from '../api/auth-client'

export const sessionQueryKey = ['auth', 'session'] as const

/** Query the current session via `GET /api/auth/me`. A 401 lands in `isError`. */
export function useSession() {
  return useQuery<AuthMeResponse>({
    queryKey: sessionQueryKey,
    queryFn: fetchSession,
    retry: false,
  })
}
