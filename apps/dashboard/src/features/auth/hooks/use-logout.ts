import { useMutation } from '@tanstack/react-query'

import { LOGIN_PATH, logout } from '../api/auth-client'

/** Log out, then send the browser to the public login page (same origin). */
export function useLogout() {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      window.location.assign(LOGIN_PATH)
    },
  })
}
