import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateProfileInput } from '@rpg/contracts'
import { sessionQueryKey } from '@/features/auth'
import { updateProfile } from '../api/user-client'

/**
 * Mutate the current user's profile (display name, email, avatar). On success
 * the session cache is invalidated so the header/sidebar reflect the new values.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionQueryKey })
    },
  })
}
