import { describe, expect, it } from 'vitest'

import {
  CONTENT_MEDIA_DOMAINS,
  CONTENT_MEDIA_POLICIES,
  contentMediaCollectionConstraintSchema,
  getContentMediaPolicy,
  resolveContentMediaMaxItems,
} from './media-policy'

describe('CONTENT_MEDIA_POLICIES', () => {
  it('resolves collection limits and rejects invalid overrides', () => {
    expect(resolveContentMediaMaxItems()).toBe(20)
    expect(resolveContentMediaMaxItems({ maxItems: 3 })).toBe(3)
    expect(contentMediaCollectionConstraintSchema.safeParse({ maxItems: 0 }).success).toBe(false)
    expect(contentMediaCollectionConstraintSchema.safeParse({ maxItems: 21 }).success).toBe(false)
    expect(contentMediaCollectionConstraintSchema.safeParse({ maxItems: 1.5 }).success).toBe(false)
  })
  it('covers every opted-in domain', () => {
    for (const domain of CONTENT_MEDIA_DOMAINS) {
      expect(getContentMediaPolicy(domain).domain).toBe(domain)
    }
  })

  it('assigns role policies per domain', () => {
    expect(CONTENT_MEDIA_POLICIES.character.allowedRoles).toEqual(['portrait', 'primary'])
    expect(CONTENT_MEDIA_POLICIES.campaign.allowedRoles).toEqual(['banner', 'primary', 'emblem'])
    expect(CONTENT_MEDIA_POLICIES.organization.allowedRoles).toEqual(['primary', 'emblem'])

    expect(getContentMediaPolicy('location').allowedRoles).toEqual(['primary', 'emblem'])

    for (const domain of ['class', 'species', 'equipment'] as const) {
      expect(getContentMediaPolicy(domain).allowedRoles).toEqual(['primary'])
    }
  })

  it('uses representative role fallbacks per domain', () => {
    expect(CONTENT_MEDIA_POLICIES.character.representativeRoles).toEqual(['portrait', 'primary'])
    expect(CONTENT_MEDIA_POLICIES.campaign.representativeRoles).toEqual(['primary', 'banner'])
    expect(CONTENT_MEDIA_POLICIES.organization.representativeRoles).toEqual(['primary'])
  })
})
