import { describe, expect, it } from 'vitest'

import {
  DEFAULT_RELATIVE_DATE_CUTOFF_DAYS,
  formatConversationDateSeparator,
  formatDateTime,
  formatFullDateTime,
  formatLocalClockTime,
  formatMessageGroupTime,
  formatRelativeOrDate,
  formatRelativeRecency,
  formatShortDate,
  INVALID_DATETIME_FALLBACK,
} from './format-datetime'

const NOW = new Date('2026-07-26T15:30:00.000Z')

describe('formatShortDate', () => {
  it('formats month and day without year', () => {
    expect(formatShortDate('2026-08-02T12:00:00.000Z')).toMatch(/Aug/)
    expect(formatShortDate('2026-08-02T12:00:00.000Z')).toMatch(/2/)
  })

  it('returns the safe fallback for invalid dates', () => {
    expect(formatShortDate('not-a-date')).toBe(INVALID_DATETIME_FALLBACK)
  })
})

describe('formatRelativeRecency', () => {
  it('labels sub-minute recency as just now', () => {
    expect(formatRelativeRecency('2026-07-26T15:29:30.000Z', NOW)).toBe('Just now')
    expect(formatRelativeRecency('2026-07-26T15:29:01.000Z', NOW)).toBe('Just now')
  })

  it('labels sub-hour recency in minutes', () => {
    expect(formatRelativeRecency('2026-07-26T15:29:00.000Z', NOW)).toBe('1 minute ago')
    expect(formatRelativeRecency('2026-07-26T15:00:00.000Z', NOW)).toBe('30 minutes ago')
  })

  it('labels sub-day recency in hours', () => {
    expect(formatRelativeRecency('2026-07-26T10:00:00.000Z', NOW)).toBe('5 hours ago')
    expect(formatRelativeRecency('2026-07-26T14:30:00.000Z', NOW)).toBe('1 hour ago')
  })

  it('labels yesterday and multi-day recency', () => {
    expect(formatRelativeRecency('2026-07-25T10:00:00.000Z', NOW)).toBe('Yesterday')
    expect(formatRelativeRecency('2026-07-24T10:00:00.000Z', NOW)).toBe('2 days ago')
  })

  it('returns the safe fallback for invalid dates', () => {
    expect(formatRelativeRecency('invalid', NOW)).toBe(INVALID_DATETIME_FALLBACK)
  })
})

describe('formatRelativeOrDate', () => {
  it('uses relative labels inside the default cutoff', () => {
    expect(
      formatRelativeOrDate('2026-07-26T10:00:00.000Z', DEFAULT_RELATIVE_DATE_CUTOFF_DAYS, NOW),
    ).toBe('5 hours ago')
    expect(
      formatRelativeOrDate('2026-07-19T10:00:00.000Z', DEFAULT_RELATIVE_DATE_CUTOFF_DAYS, NOW),
    ).toBe('7 days ago')
  })

  it('falls back to short dates beyond the cutoff', () => {
    expect(
      formatRelativeOrDate('2026-07-18T10:00:00.000Z', DEFAULT_RELATIVE_DATE_CUTOFF_DAYS, NOW),
    ).toMatch(/Jul/)
  })
})

describe('formatDateTime', () => {
  it('includes date and time', () => {
    const formatted = formatDateTime('2026-07-26T15:30:00.000Z')
    expect(formatted).toMatch(/2026|26/)
    expect(formatted).toMatch(/30/)
  })

  it('returns the safe fallback for invalid dates', () => {
    expect(formatDateTime('invalid')).toBe(INVALID_DATETIME_FALLBACK)
  })
})

describe('formatFullDateTime', () => {
  it('matches formatDateTime output', () => {
    expect(formatFullDateTime('2026-07-26T15:30:00.000Z')).toBe(
      formatDateTime('2026-07-26T15:30:00.000Z'),
    )
  })
})

describe('formatLocalClockTime', () => {
  it('formats local clock time without a date', () => {
    const formatted = formatLocalClockTime('2026-07-26T15:30:00.000Z')
    expect(formatted).toMatch(/30/)
    expect(formatted).not.toMatch(/2026/)
  })

  it('returns the safe fallback for invalid dates', () => {
    expect(formatLocalClockTime('invalid')).toBe(INVALID_DATETIME_FALLBACK)
  })
})

describe('formatMessageGroupTime', () => {
  it('labels sub-minute recency as just now', () => {
    expect(formatMessageGroupTime('2026-07-26T15:29:45.000Z', NOW)).toBe('Just now')
  })

  it('labels sub-hour recency in minutes', () => {
    expect(formatMessageGroupTime('2026-07-26T15:29:00.000Z', NOW)).toBe('1 minute ago')
    expect(formatMessageGroupTime('2026-07-26T14:31:00.000Z', NOW)).toBe('59 minutes ago')
  })

  it('falls back to local clock time after one hour', () => {
    const formatted = formatMessageGroupTime('2026-07-26T10:00:00.000Z', NOW)
    expect(formatted).toMatch(/00/)
    expect(formatted).not.toMatch(/hour/)
  })

  it('returns the safe fallback for invalid dates', () => {
    expect(formatMessageGroupTime('invalid', NOW)).toBe(INVALID_DATETIME_FALLBACK)
  })
})

describe('formatConversationDateSeparator', () => {
  it('labels today and yesterday', () => {
    expect(formatConversationDateSeparator('2026-07-26T10:00:00.000Z', NOW)).toBe('Today')
    expect(formatConversationDateSeparator('2026-07-25T10:00:00.000Z', NOW)).toBe('Yesterday')
  })

  it('uses weekday names for the previous six calendar days', () => {
    expect(formatConversationDateSeparator('2026-07-24T10:00:00.000Z', NOW)).toMatch(/Friday/i)
    expect(formatConversationDateSeparator('2026-07-20T10:00:00.000Z', NOW)).toMatch(/Monday/i)
  })

  it('uses a short date with year beyond the weekday window', () => {
    expect(formatConversationDateSeparator('2026-07-19T10:00:00.000Z', NOW)).toMatch(/Jul/)
    expect(formatConversationDateSeparator('2026-07-19T10:00:00.000Z', NOW)).toMatch(/2026/)
  })

  it('returns the safe fallback for invalid dates', () => {
    expect(formatConversationDateSeparator('invalid', NOW)).toBe(INVALID_DATETIME_FALLBACK)
  })
})
