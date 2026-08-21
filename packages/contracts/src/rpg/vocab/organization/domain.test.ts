import { describe, expect, it } from 'vitest'

import {
  ORGANIZATION_DOMAIN_IDS,
  getOrganizationDomainDiscoveryTerms,
  getOrganizationDomainLabel,
  organizationDomainSchema,
} from './domain'

describe('Organization Domain vocabulary', () => {
  it('defines the exact single-domain set', () => {
    expect(ORGANIZATION_DOMAIN_IDS).toEqual([
      'government',
      'political',
      'religious',
      'military',
      'criminal',
      'commercial',
      'occupational',
      'academic',
      'community',
      'other',
    ])
    expect(organizationDomainSchema.safeParse('professional').success).toBe(false)
  })

  it('owns local discovery metadata', () => {
    expect(getOrganizationDomainDiscoveryTerms('occupational')).toContain('professional')
    expect(getOrganizationDomainLabel('custom')).toBe('custom')
  })
})
