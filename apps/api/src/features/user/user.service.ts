import { isValidObjectId } from 'mongoose'
import type { Role, SessionUser, User } from '@rpg/contracts'

import { UserModel, type UserSchemaType } from './user.model'

type UserRecord = UserSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

/** A user plus the password hash, used only by the auth login path. */
export interface UserWithSecret extends User {
  passwordHash: string
}

function toUser(doc: UserRecord): User {
  return {
    id: String(doc._id),
    email: doc.email,
    displayName: doc.displayName,
    role: doc.role as Role,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

export function toSessionUser(user: User): SessionUser {
  const { id, email, displayName, role } = user
  return { id, email, displayName, role }
}

export interface CreateUserInput {
  email: string
  passwordHash: string
  displayName: string
  role?: Role
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const doc = await UserModel.create({
    email: input.email,
    passwordHash: input.passwordHash,
    displayName: input.displayName,
    ...(input.role ? { role: input.role } : {}),
  })
  return toUser(doc.toObject() as UserRecord)
}

export async function findUserByEmailWithSecret(email: string): Promise<UserWithSecret | null> {
  const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean<UserRecord | null>()
  if (!doc) return null
  return { ...toUser(doc), passwordHash: doc.passwordHash }
}

export async function findSessionUserById(id: string): Promise<SessionUser | null> {
  if (!isValidObjectId(id)) return null
  const doc = await UserModel.findById(id).lean<UserRecord | null>()
  if (!doc) return null
  return toSessionUser(toUser(doc))
}
