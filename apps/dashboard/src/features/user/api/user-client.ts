import type { SessionUser, UpdateProfileInput, ChangePasswordInput } from '@rpg/contracts'

import { patchJson } from '@/lib/api-client'

/** Update the current user's profile and return the updated session user. */
export async function updateProfile(input: UpdateProfileInput): Promise<SessionUser> {
  const { user } = await patchJson<{ user: SessionUser }>(
    '/api/users/me',
    input,
    'Could not update profile.',
  )
  return user
}

/** Change the current user's password. Throws `ApiError` on wrong current password. */
export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await patchJson<{ ok: true }>('/api/users/me/password', input, 'Could not change password.')
}
