import { useSession } from './use-session'

/** Returns true when the current user holds an elevated platform role (admin or superadmin). */
export function useIsElevatedPlatformRole(): boolean {
  const { data: session } = useSession()
  const user = session?.user
  return user?.role === 'admin' || user?.role === 'superadmin'
}
