import type { AdminUserCampaignCounts, AdminUserDeleteBlockReason } from '@rpg/contracts'
import { USER_RECENT_ACTIVITY_DAYS } from '@rpg/contracts'

import { formatRelativeRecency } from '@/lib/datetime/format-datetime'

export const ADMIN_USERS_TABLE_KEY = 'admin-users'

export const ADMIN_USERS_DEFAULT_SORT = '-createdAt' as const

export const ADMIN_USERS_ALLOWED_SORT_IDS = [
  'displayName',
  'role',
  'lastActiveAt',
  'createdAt',
] as const

export function formatAdminUserCampaignCounts(counts: AdminUserCampaignCounts): string {
  const segments: string[] = []

  if (counts.owned > 0) {
    segments.push(`${counts.owned} owned`)
  }
  if (counts.coOwned > 0) {
    segments.push(`${counts.coOwned} co-owned`)
  }
  if (counts.joined > 0) {
    segments.push(`${counts.joined} joined`)
  }

  return segments.length > 0 ? segments.join(' · ') : '—'
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatAbsoluteDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function formatJoinedDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatAdminUserLastActive(value: string | null): {
  label: string
  absoluteLabel: string
} {
  if (!value) {
    return { label: 'Never', absoluteLabel: 'Never active' }
  }

  const date = new Date(value)
  const absoluteLabel = formatAbsoluteDate(value)
  const today = startOfDay(new Date())
  const valueDay = startOfDay(date)
  const dayDiff = Math.round((today.getTime() - valueDay.getTime()) / (24 * 60 * 60 * 1000))

  if (dayDiff >= 0 && dayDiff <= USER_RECENT_ACTIVITY_DAYS) {
    return { label: formatRelativeRecency(value), absoluteLabel }
  }

  return { label: absoluteLabel, absoluteLabel }
}

export function formatAdminUserJoined(value: string): string {
  return formatJoinedDate(value)
}

const DELETE_BLOCK_REASON_MESSAGES: Record<AdminUserDeleteBlockReason, string> = {
  insufficient_role: 'Only superadmins can delete users',
  self: 'You cannot delete your own account',
  last_superadmin: 'This user is the last superadmin',
  owns_campaigns: 'This user owns one or more campaigns',
  character_referenced_by_locations:
    'One or more of this user’s characters are linked from a location',
}

export function getPrimaryDeleteBlockReasonMessage(
  reasons: readonly AdminUserDeleteBlockReason[],
): string | undefined {
  const priority: AdminUserDeleteBlockReason[] = [
    'insufficient_role',
    'self',
    'last_superadmin',
    'owns_campaigns',
    'character_referenced_by_locations',
  ]

  for (const reason of priority) {
    if (reasons.includes(reason)) {
      return DELETE_BLOCK_REASON_MESSAGES[reason]
    }
  }

  return undefined
}

export function adminUsersActivityFilterLabel(): string {
  return `Active in last ${USER_RECENT_ACTIVITY_DAYS} days`
}

export function adminUsersInactiveFilterLabel(): string {
  return `Inactive for ${USER_RECENT_ACTIVITY_DAYS}+ days`
}
