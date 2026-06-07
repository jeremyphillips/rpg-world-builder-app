import bcrypt from 'bcryptjs'
import type { LoginInput, RegisterInput, User } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { createUser, findUserByEmailWithSecret } from '../user'

const BCRYPT_ROUNDS = 12

export async function registerUser(input: RegisterInput): Promise<User> {
  const existing = await findUserByEmailWithSecret(input.email)
  if (existing) {
    throw HttpError.conflict('An account with that email already exists')
  }
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
  return createUser({
    email: input.email,
    passwordHash,
    displayName: input.displayName,
  })
}

export async function authenticateUser(input: LoginInput): Promise<User> {
  const record = await findUserByEmailWithSecret(input.email)
  // Compare against a dummy hash when the user is absent to blunt timing/enumeration.
  const hash =
    record?.passwordHash ?? '$2b$12$0000000000000000000000000000000000000000000000000000a'
  const ok = await bcrypt.compare(input.password, hash)
  if (!record || !ok) {
    throw HttpError.unauthorized('Invalid email or password')
  }
  const { passwordHash: _passwordHash, ...user } = record
  return user
}
