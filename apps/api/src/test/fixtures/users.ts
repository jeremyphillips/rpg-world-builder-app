import type { User } from '@rpg/contracts'

import { createUser } from '../../features/user'

type MakeTestUserOptions = {
  email?: string
  displayName?: string
}

/** Creates a persisted user for service-level integration tests. */
export async function makeTestUser(options: MakeTestUserOptions = {}): Promise<User> {
  const email = options.email ?? 'owner@example.com'

  return createUser({
    email,
    passwordHash: 'x',
    displayName: options.displayName ?? email,
  })
}
