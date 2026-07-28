import type { AdminUsersListQuery } from '@rpg/contracts'
import { USER_RECENT_ACTIVITY_DAYS } from '@rpg/contracts'
import type { SortOrder } from 'mongoose'

import {
  toUserWithActivityTimestamps,
  UserModel,
  type UserSchemaType,
  type UserWithActivityTimestamps,
} from '../user'
import {
  buildAdminUserListItem,
  getCampaignCountsForUsers,
  getCharacterCountsForUsers,
} from './admin-user-summary.service'

type UserRecord = UserSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
  lastSignedInAt?: Date | null
  lastActiveAt?: Date | null
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildSearchFilter(search: string | undefined): Record<string, unknown> {
  const trimmed = search?.trim()
  if (!trimmed) return {}

  const pattern = escapeRegex(trimmed)
  return {
    $or: [
      { displayName: { $regex: pattern, $options: 'i' } },
      { email: { $regex: pattern, $options: 'i' } },
    ],
  }
}

function buildAccessFilter(access: AdminUsersListQuery['access']): Record<string, unknown> {
  if (access === 'all') return {}
  return { role: access }
}

function buildActivityFilter(activity: AdminUsersListQuery['activity']): Record<string, unknown> {
  if (activity === 'all') return {}

  const activityCutoff = new Date(Date.now() - USER_RECENT_ACTIVITY_DAYS * 24 * 60 * 60 * 1000)

  if (activity === 'active') {
    return { lastActiveAt: { $gte: activityCutoff } }
  }

  if (activity === 'inactive') {
    return {
      lastActiveAt: { $ne: null, $lt: activityCutoff },
    }
  }

  return {
    $or: [{ lastActiveAt: null }, { lastActiveAt: { $exists: false } }],
  }
}

function parseSort(sort: AdminUsersListQuery['sort']): Record<string, SortOrder> {
  const desc = sort.startsWith('-')
  const field = desc ? sort.slice(1) : sort

  if (field === 'role') {
    return { role: desc ? -1 : 1, createdAt: -1 }
  }

  return { [field]: desc ? -1 : 1 }
}

export async function listAdminUsers(
  query: AdminUsersListQuery,
  actor: { id: string; role: UserWithActivityTimestamps['role'] },
) {
  const filter: Record<string, unknown> = {
    ...buildSearchFilter(query.q),
    ...buildAccessFilter(query.access),
    ...buildActivityFilter(query.activity),
  }

  const sort = parseSort(query.sort)
  const skip = (query.page - 1) * query.pageSize

  const [total, docs] = await Promise.all([
    UserModel.countDocuments(filter),
    UserModel.find(filter).sort(sort).skip(skip).limit(query.pageSize).lean<UserRecord[]>(),
  ])

  const users = docs.map(toUserWithActivityTimestamps)
  const userIds = users.map((user) => user.id)
  const [campaignCounts, characterCounts] = await Promise.all([
    getCampaignCountsForUsers(userIds),
    getCharacterCountsForUsers(userIds),
  ])

  const rows = await Promise.all(
    users.map((user) =>
      buildAdminUserListItem(
        user,
        actor,
        campaignCounts.get(user.id) ?? { owned: 0, coOwned: 0, joined: 0 },
        characterCounts.get(user.id) ?? 0,
      ),
    ),
  )

  return {
    users: rows,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
    },
  }
}
