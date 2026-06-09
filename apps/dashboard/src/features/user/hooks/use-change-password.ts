import { useMutation } from '@tanstack/react-query'

import type { ChangePasswordInput } from '@rpg/contracts'
import { changePassword } from '../api/user-client'

/** Mutate the current user's password. Returns no data on success. */
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(input),
  })
}
