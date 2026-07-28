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
  it('labels today, yesterday, and multi-day recency', () => {
    expect(formatRelativeRecency('2026-07-26T10:00:00.000Z', NOW)).toBe('Today')
    expect(formatRelativeRecency('2026-07-25T10:00:00.000Z', NOW)).toBe('Yesterday')
    expect(formatRelativeRecency('2026-07-24T10:00:00.000Z', NOW)).toBe('2 days ago')
  })
})

describe('formatRelativeOrDate', () => {
  it('uses relative labels inside the default cutoff', () => {
    expect(
      formatRelativeOrDate('2026-07-26T10:00:00.000Z', DEFAULT_RELATIVE_DATE_CUTOFF_DAYS, NOW),
    ).toBe('Today')
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
