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
    ])
    for (const rejected of ['house', 'force', 'army', 'bank', 'church', 'academy']) {
      expect(organizationFormSchema.safeParse(rejected).success).toBe(false)
    }
  })

  it('owns local discovery and title metadata', () => {
    expect(getOrganizationFormDiscoveryTerms('network')).toContain('ring')
    for (const entry of Object.values(ORGANIZATION_FORM_ENTRIES)) {
      expect(entry.memberTitles).toHaveLength(5)
    }
  })
})
