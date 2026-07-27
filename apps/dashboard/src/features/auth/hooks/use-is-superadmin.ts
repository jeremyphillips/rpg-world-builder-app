import { useSession } from '@/features/auth/hooks/use-session'

/** Returns true when the current user is a superadmin. */
export function useIsSuperadmin(): boolean {
  const { data: session } = useSession()
  return session?.user.role === 'superadmin'
}
