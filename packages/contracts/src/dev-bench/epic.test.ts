import { describe, expect, it } from 'vitest'

import { epicSchema, epicStatusSchema, getEpicStatusLabel } from './epic'

const validEpic = {
  id: 'epic_1',
  title: 'Rules Configuration',
  description: 'Campaign rules authoring',
  goal: 'Patch-based rules editing',
  status: 'active',
  priority: 'high',
  area: 'rules',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

describe('epicStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(epicStatusSchema.safeParse('active').success).toBe(true)
    expect(epicStatusSchema.safeParse('paused').success).toBe(true)
  })

  it('rejects invalid statuses', () => {
    expect(epicStatusSchema.safeParse('archived').success).toBe(false)
  })
})

describe('epicSchema', () => {
  it('accepts a valid epic', () => {
    expect(epicSchema.safeParse(validEpic).success).toBe(true)
  })
})

describe('getEpicStatusLabel', () => {
  it('returns labels for known statuses', () => {
    expect(getEpicStatusLabel('done')).toBe('Done')
  })
})
