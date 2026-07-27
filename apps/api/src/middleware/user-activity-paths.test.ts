import { describe, expect, it } from 'vitest'

import { shouldRecordUserActivity } from './user-activity-paths'

describe('shouldRecordUserActivity', () => {
  it('skips auth and health paths', () => {
    expect(shouldRecordUserActivity('/api/auth/me')).toBe(false)
    expect(shouldRecordUserActivity('/api/auth/csrf')).toBe(false)
    expect(shouldRecordUserActivity('/api/health')).toBe(false)
    expect(shouldRecordUserActivity('/api/bench/tickets')).toBe(false)
  })

  it('allows domain API paths', () => {
    expect(shouldRecordUserActivity('/api/campaigns')).toBe(true)
    expect(shouldRecordUserActivity('/api/characters')).toBe(true)
    expect(shouldRecordUserActivity('/api/admin/users')).toBe(true)
  })
})
