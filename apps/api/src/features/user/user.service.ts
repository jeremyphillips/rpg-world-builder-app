import bcrypt from 'bcryptjs'
import { isValidObjectId } from 'mongoose'
import type { PlatformRole, SessionUser, UpdateProfileInput, User } from '@rpg/contracts'
import { USER_ACTIVITY_WRITE_INTERVAL_MINUTES } from '@rpg/contracts'

import { BCRYPT_ROUNDS } from '../../lib/bcrypt-rounds'
import { HttpError } from '../../lib/http-error'
import { UserModel, type UserSchemaType } from './user.model'

type UserRecord = UserSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
  lastSignedInAt?: Date | null
  lastActiveAt?: Date | null
}

/** A user plus the password hash, used only by the auth login path. */
export interface UserWithSecret extends User {
  passwordHash: string
}

function toIsoDate(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null
}

function toUser(doc: UserRecord): User {
  return {
    id: String(doc._id),
    email: doc.email,
    displayName: doc.displayName,
    avatarKey: doc.avatarKey ?? undefined,
    role: doc.role as PlatformRole,
    lastSelectedCampaignId: doc.lastSelectedCampaignId ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

export type UserWithActivityTimestamps = User & {
  lastSignedInAt: string | null
  lastActiveAt: string | null
}

export function toUserWithActivityTimestamps(doc: UserRecord): UserWithActivityTimestamps {
  return {
    ...toUser(doc),
    lastSignedInAt: toIsoDate(doc.lastSignedInAt),
    lastActiveAt: toIsoDate(doc.lastActiveAt),
  }
}

export function toSessionUser(user: User): SessionUser {
  const { id, email, displayName, avatarKey, role, lastSelectedCampaignId } = user
  return { id, email, displayName, avatarKey, role, lastSelectedCampaignId }
}

export interface CreateUserInput {
  email: string
  passwordHash: string
  displayName: string
  role?: PlatformRole
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

export async function findUserByEmail(email: string): Promise<User | null> {
  const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean<UserRecord | null>()
  if (!doc) return null
  return toUser(doc)
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

export async function findUsersByIds(ids: readonly string[]): Promise<User[]> {
  const validIds = ids.filter((id) => isValidObjectId(id))
  if (validIds.length === 0) return []

  const docs = await UserModel.find({ _id: { $in: validIds } }).lean<UserRecord[]>()
  return docs.map(toUser)
}

export async function findUserWithActivityTimestampsById(
  id: string,
): Promise<UserWithActivityTimestamps | null> {
  if (!isValidObjectId(id)) return null
  const doc = await UserModel.findById(id).lean<UserRecord | null>()
  if (!doc) return null
  return toUserWithActivityTimestamps(doc)
}

export async function countSuperadminsExcluding(userId?: string): Promise<number> {
  const filter: Record<string, unknown> = { role: 'superadmin' }
  if (userId && isValidObjectId(userId)) {
    filter._id = { $ne: userId }
  }
  return UserModel.countDocuments(filter)
}

/** Sets both timestamps on successful login. */
export async function recordUserLoginActivity(userId: string): Promise<void> {
  if (!isValidObjectId(userId)) return

  const now = new Date()
  await UserModel.updateOne({ _id: userId }, { $set: { lastSignedInAt: now, lastActiveAt: now } })
}

/**
 * Throttled write for meaningful authenticated API use. Skips when the stored
 * `lastActiveAt` is within `USER_ACTIVITY_WRITE_INTERVAL_MINUTES`.
 */
export async function recordUserActivity(userId: string): Promise<void> {
  if (!isValidObjectId(userId)) return

  const now = new Date()
  const throttleMs = USER_ACTIVITY_WRITE_INTERVAL_MINUTES * 60 * 1000
  const throttleCutoff = new Date(now.getTime() - throttleMs)

  await UserModel.updateOne(
    {
      _id: userId,
      $or: [{ lastActiveAt: null }, { lastActiveAt: { $lt: throttleCutoff } }],
    },
    { $set: { lastActiveAt: now } },
  )
}

/**
 * Persist the user's most recently selected campaign. Membership is validated
 * by the caller; this only writes the preference and returns the updated user.
 * Pass `null` to clear a stale or revoked selection.
 */
export async function updateLastSelectedCampaign(
  userId: string,
  campaignId: string | null,
): Promise<SessionUser | null> {
  if (!isValidObjectId(userId)) return null
  const doc = await UserModel.findByIdAndUpdate(
    userId,
    { lastSelectedCampaignId: campaignId },
    { new: true },
  ).lean<UserRecord | null>()
  if (!doc) return null
  return toSessionUser(toUser(doc))
}

/**
 * Update a user's mutable profile fields. Returns the updated session user so
 * the caller can refresh the client session.
 *
 * NOTE: email changes take effect immediately without verification — see
 * docs/security.md for the planned verification step.
 */
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<SessionUser | null> {
  if (!isValidObjectId(userId)) return null

  const patch: Partial<{ displayName: string; email: string; avatarKey: string }> = {}
  if (input.displayName !== undefined) patch.displayName = input.displayName
  if (input.email !== undefined) patch.email = input.email.toLowerCase()
  if (input.avatarKey !== undefined) patch.avatarKey = input.avatarKey

  if (Object.keys(patch).length === 0) {
    const doc = await UserModel.findById(userId).lean<UserRecord | null>()
    return doc ? toSessionUser(toUser(doc)) : null
  }

  const doc = await UserModel.findByIdAndUpdate(userId, patch, {
    new: true,
  }).lean<UserRecord | null>()
  if (!doc) return null
  return toSessionUser(toUser(doc))
}

/**
 * Change a user's password after verifying the current one.
 *
 * NOTE: Other active sessions are not invalidated — see docs/security.md.
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!isValidObjectId(userId)) throw HttpError.unauthorized()

  const doc = await UserModel.findById(userId).lean<UserRecord | null>()
  if (!doc) throw HttpError.unauthorized()

  const ok = await bcrypt.compare(currentPassword, doc.passwordHash)
  if (!ok) throw HttpError.badRequest('Current password is incorrect')

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
  await UserModel.findByIdAndUpdate(userId, { passwordHash: newHash })
}
