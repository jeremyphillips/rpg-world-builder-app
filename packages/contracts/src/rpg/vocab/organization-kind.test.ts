import { describe, expect, it } from 'vitest'

import {
  ORGANIZATION_KIND_ENTRIES,
  ORGANIZATION_KIND_IDS,
  getOrganizationKindEntry,
  getOrganizationKindLabel,
  organizationKindSchema,
} from './organization-kind'

describe('organizationKindSchema', () => {
  it('accepts every registered organization kind', () => {
    expect(ORGANIZATION_KIND_IDS).toHaveLength(10)

    for (const id of ORGANIZATION_KIND_IDS) {
      expect(organizationKindSchema.parse(id)).toBe(id)
    }
  })

  it('rejects unknown organization kinds', () => {
    expect(organizationKindSchema.safeParse('social').success).toBe(false)
    expect(organizationKindSchema.safeParse('secret').success).toBe(false)
  })
})

describe('organization kind vocabulary', () => {
  it('provides a label and description for every kind', () => {
    for (const id of ORGANIZATION_KIND_IDS) {
      const entry = getOrganizationKindEntry(id)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('keeps professional and academic coverage distinct', () => {
    expect(ORGANIZATION_KIND_ENTRIES.professional.description).not.toContain('learned societ')
    expect(ORGANIZATION_KIND_ENTRIES.academic.description).toContain('learned society')
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getOrganizationKindLabel('community')).toBe('Community Organization')
    expect(getOrganizationKindLabel('custom')).toBe('custom')
  })
})
