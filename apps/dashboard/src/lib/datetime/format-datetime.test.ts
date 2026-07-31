import { describe, expect, it } from 'vitest'

import {
  DEFAULT_RELATIVE_DATE_CUTOFF_DAYS,
  formatDateTime,
  formatRelativeOrDate,
  formatRelativeRecency,
  formatShortDate,
} from './format-datetime'

const NOW = new Date('2026-07-26T15:30:00.000Z')

describe('formatShortDate', () => {
  it('formats month and day without year', () => {
    expect(formatShortDate('2026-08-02T12:00:00.000Z')).toMatch(/Aug/)
    expect(formatShortDate('2026-08-02T12:00:00.000Z')).toMatch(/2/)
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
})
