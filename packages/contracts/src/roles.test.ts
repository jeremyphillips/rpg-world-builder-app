import { describe, expect, it } from 'vitest'
import { CAMPAIGN_ROLES, PLATFORM_ROLES, campaignRoleSchema, platformRoleSchema } from './roles'

describe('platformRoleSchema', () => {
  it('accepts every known platform role', () => {
    for (const role of PLATFORM_ROLES) {
      expect(platformRoleSchema.parse(role)).toBe(role)
    }
  })

  it('rejects campaign roles', () => {
    expect(platformRoleSchema.safeParse('pc').success).toBe(false)
    expect(platformRoleSchema.safeParse('owner').success).toBe(false)
  })

  it('rejects unknown values', () => {
    expect(platformRoleSchema.safeParse('wizard').success).toBe(false)
  })
})

describe('campaignRoleSchema', () => {
  it('accepts every known campaign role', () => {
    for (const role of CAMPAIGN_ROLES) {
      expect(campaignRoleSchema.parse(role)).toBe(role)
    }
  })

  it('rejects platform roles', () => {
    expect(campaignRoleSchema.safeParse('user').success).toBe(false)
    expect(campaignRoleSchema.safeParse('admin').success).toBe(false)
  })

  it('rejects unknown values', () => {
    expect(campaignRoleSchema.safeParse('wizard').success).toBe(false)
  })
})
