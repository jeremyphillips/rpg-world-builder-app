import { USER_RECENT_ACTIVITY_DAYS } from '@rpg/contracts'

import { formatRelativeRecency } from '@/lib/datetime/format-datetime'

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

function formatJoinedDetailDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatAdminUserDetailTimestamp(value: string | null): string {
  if (!value) return 'Never'

  const date = new Date(value)
  const today = startOfDay(new Date())
  const valueDay = startOfDay(date)

  if (today.getTime() === valueDay.getTime()) {
    return `Today at ${new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)}`
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatAdminUserDetailJoined(value: string): string {
  return formatJoinedDetailDate(value)
}

export function formatAdminUserDetailLastActive(value: string | null): string {
  if (!value) return 'Never'

  const date = new Date(value)
  const today = startOfDay(new Date())
  const valueDay = startOfDay(date)
  const dayDiff = Math.round((today.getTime() - valueDay.getTime()) / (24 * 60 * 60 * 1000))

  if (dayDiff >= 0 && dayDiff <= USER_RECENT_ACTIVITY_DAYS) {
    return formatRelativeRecency(value)
  }

  return formatAbsoluteDate(value)
}
