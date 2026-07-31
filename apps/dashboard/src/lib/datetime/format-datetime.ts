const MS_PER_SECOND = 1000
const MS_PER_MINUTE = 60 * MS_PER_SECOND
const MS_PER_HOUR = 60 * MS_PER_MINUTE
const MS_PER_DAY = 24 * MS_PER_HOUR

export const DEFAULT_RELATIVE_DATE_CUTOFF_DAYS = 7

/** Safe fallback when an ISO value cannot be parsed — never surface "Invalid Date". */
export const INVALID_DATETIME_FALLBACK = 'Unknown date'

function parseValidDate(value: string): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dayDiffFromToday(value: string, now = new Date()): number | null {
  const valueDate = parseValidDate(value)
  const nowDate = parseValidDate(now.toISOString()) ?? now
  if (!valueDate) return null

  const today = startOfDay(nowDate)
  const valueDay = startOfDay(valueDate)
  return Math.round((today.getTime() - valueDay.getTime()) / MS_PER_DAY)
}

function elapsedMs(value: string, now: Date): number | null {
  const valueDate = parseValidDate(value)
  if (!valueDate) return null
  return now.getTime() - valueDate.getTime()
}

function formatMinutesAgo(minutes: number): string {
  return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
}

function formatHoursAgo(hours: number): string {
  return `${hours} hour${hours === 1 ? '' : 's'} ago`
}

function formatWithValidDate(value: string, formatter: (date: Date) => string): string {
  const date = parseValidDate(value)
  if (!date) return INVALID_DATETIME_FALLBACK
  return formatter(date)
}

export function formatShortDate(value: string): string {
  return formatWithValidDate(value, (date) =>
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(date),
  )
}

export function formatDateTime(value: string): string {
  return formatWithValidDate(value, (date) =>
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date),
  )
}

/** Full absolute timestamp for `title` / a11y surfaces. */
export function formatFullDateTime(value: string): string {
  return formatDateTime(value)
}

export function formatLocalClockTime(value: string): string {
  return formatWithValidDate(value, (date) =>
    new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date),
  )
}

export function formatRelativeRecency(value: string, now = new Date()): string {
  const elapsed = elapsedMs(value, now)
  if (elapsed === null) return INVALID_DATETIME_FALLBACK

  if (elapsed < MS_PER_MINUTE) return 'Just now'

  if (elapsed < MS_PER_HOUR) {
    return formatMinutesAgo(Math.floor(elapsed / MS_PER_MINUTE))
  }

  if (elapsed < MS_PER_DAY) {
    return formatHoursAgo(Math.floor(elapsed / MS_PER_HOUR))
  }

  const dayDiff = dayDiffFromToday(value, now)
  if (dayDiff === null) return INVALID_DATETIME_FALLBACK

  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Yesterday'
  if (dayDiff > 1) return `${dayDiff} days ago`

  return formatShortDate(value)
}

/** Group metadata: relative for recent bubbles, local clock for older same-day or prior days. */
export function formatMessageGroupTime(value: string, now = new Date()): string {
  const elapsed = elapsedMs(value, now)
  if (elapsed === null) return INVALID_DATETIME_FALLBACK

  if (elapsed < MS_PER_MINUTE) return 'Just now'

  if (elapsed < MS_PER_HOUR) {
    return formatMinutesAgo(Math.floor(elapsed / MS_PER_MINUTE))
  }

  return formatLocalClockTime(value)
}

/** Date separator between calendar-day message groups in a thread. */
export function formatConversationDateSeparator(value: string, now = new Date()): string {
  const dayDiff = dayDiffFromToday(value, now)
  if (dayDiff === null) return INVALID_DATETIME_FALLBACK

  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Yesterday'

  if (dayDiff >= 2 && dayDiff <= 6) {
    return formatWithValidDate(value, (date) =>
      new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(date),
    )
  }

  return formatWithValidDate(value, (date) =>
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date),
  )
}

export function formatRelativeOrDate(
  value: string,
  cutoffDays = DEFAULT_RELATIVE_DATE_CUTOFF_DAYS,
  now = new Date(),
): string {
  const dayDiff = dayDiffFromToday(value, now)
  if (dayDiff === null) return INVALID_DATETIME_FALLBACK

  if (dayDiff >= 0 && dayDiff <= cutoffDays) {
    return formatRelativeRecency(value, now)
  }

  return formatShortDate(value)
}
