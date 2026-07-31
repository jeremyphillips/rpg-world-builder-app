const MS_PER_SECOND = 1000
const MS_PER_MINUTE = 60 * MS_PER_SECOND
const MS_PER_HOUR = 60 * MS_PER_MINUTE
const MS_PER_DAY = 24 * MS_PER_HOUR

export const DEFAULT_RELATIVE_DATE_CUTOFF_DAYS = 7

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dayDiffFromToday(value: string, now = new Date()): number {
  const today = startOfDay(now)
  const valueDay = startOfDay(new Date(value))
  return Math.round((today.getTime() - valueDay.getTime()) / MS_PER_DAY)
}

function elapsedMs(value: string, now: Date): number {
  return now.getTime() - new Date(value).getTime()
}

function formatMinutesAgo(minutes: number): string {
  return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
}

function formatHoursAgo(hours: number): string {
  return `${hours} hour${hours === 1 ? '' : 's'} ago`
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatRelativeRecency(value: string, now = new Date()): string {
  const elapsed = elapsedMs(value, now)

  if (elapsed < MS_PER_MINUTE) return 'Just now'

  if (elapsed < MS_PER_HOUR) {
    return formatMinutesAgo(Math.floor(elapsed / MS_PER_MINUTE))
  }

  if (elapsed < MS_PER_DAY) {
    return formatHoursAgo(Math.floor(elapsed / MS_PER_HOUR))
  }

  const dayDiff = dayDiffFromToday(value, now)

  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Yesterday'
  if (dayDiff > 1) return `${dayDiff} days ago`

  return formatShortDate(value)
}

export function formatRelativeOrDate(
  value: string,
  cutoffDays = DEFAULT_RELATIVE_DATE_CUTOFF_DAYS,
  now = new Date(),
): string {
  const dayDiff = dayDiffFromToday(value, now)

  if (dayDiff >= 0 && dayDiff <= cutoffDays) {
    return formatRelativeRecency(value, now)
  }

  return formatShortDate(value)
}
