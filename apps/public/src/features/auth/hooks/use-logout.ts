import { useMutation } from '@tanstack/react-query'
import { CROSS_APP_PATHS } from '@rpg/contracts'

import { logout } from '../api/auth-client'

/** Log out, then send the browser to the public login page (same origin). */
export function useLogout() {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      window.location.assign(CROSS_APP_PATHS.login)
    },
  })
}
