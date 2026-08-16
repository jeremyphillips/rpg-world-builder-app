import { describe, expect, it } from 'vitest'

import {
  ORGANIZATION_FORM_ENTRIES,
  ORGANIZATION_FORM_IDS,
  getOrganizationFormDiscoveryTerms,
  organizationFormSchema,
} from './organization-form'

describe('Organization Form vocabulary', () => {
  it('keeps the first form set reusable and narrow', () => {
    expect(ORGANIZATION_FORM_IDS).toEqual([
      'association',
      'congregation',
      'company',
      'cooperative',
      'guild',
      'network',
      'order',
      'force',
      'office',
    ])
    for (const rejected of ['house', 'army', 'bank', 'church', 'academy']) {
      expect(organizationFormSchema.safeParse(rejected).success).toBe(false)
    }
    expect(organizationFormSchema.parse('force')).toBe('force')
    expect(organizationFormSchema.parse('office')).toBe('office')
  })

  it('owns local discovery and title metadata', () => {
    expect(getOrganizationFormDiscoveryTerms('network')).toContain('ring')
    expect(getOrganizationFormDiscoveryTerms('force')).toContain('host')
    expect(getOrganizationFormDiscoveryTerms('office')).toContain('bureau')
    for (const entry of Object.values(ORGANIZATION_FORM_ENTRIES)) {
      expect(entry.memberTitles).toHaveLength(5)
    }
  })
})
