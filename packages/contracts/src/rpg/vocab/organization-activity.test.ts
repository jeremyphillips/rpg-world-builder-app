import { describe, expect, it } from 'vitest'

import {
  ORGANIZATION_ACTIVITY_ENTRIES,
  ORGANIZATION_ACTIVITY_IDS,
  getOrganizationActivityDiscoveryTerms,
  getOrganizationActivityEntry,
  organizationActivitySchema,
} from './organization-activity'

describe('Organization Activity vocabulary', () => {
  it('keeps the initial registry narrow and schema-backed', () => {
    expect(ORGANIZATION_ACTIVITY_IDS).toEqual([
      'blacksmithing',
      'brewing',
      'worship',
      'ministry',
      'warfare',
      'defense',
      'banking',
      'finance',
      'education',
      'training',
      'research',
      'standards',
      'apprenticeship',
      'smuggling',
      'trade',
      'production',
      'transport',
      'administration',
      'extortion',
    ])
    expect(Object.keys(ORGANIZATION_ACTIVITY_ENTRIES)).toEqual(ORGANIZATION_ACTIVITY_IDS)
    expect(organizationActivitySchema.parse('blacksmithing')).toBe('blacksmithing')
    expect(organizationActivitySchema.parse('banking')).toBe('banking')
    expect(organizationActivitySchema.parse('trade')).toBe('trade')
    expect(organizationActivitySchema.parse('administration')).toBe('administration')
    expect(organizationActivitySchema.parse('extortion')).toBe('extortion')
    expect(organizationActivitySchema.safeParse('advocacy')).toMatchObject({ success: false })
  })

  it('defines non-empty labels and descriptions', () => {
    for (const entry of Object.values(ORGANIZATION_ACTIVITY_ENTRIES)) {
      expect(entry.label.trim()).not.toBe('')
      expect(entry.description.trim()).not.toBe('')
      expect(entry.memberTitles).toHaveLength(5)
    }
  })

  it('admits extortion as a sustained organizational practice without opening the crime catalog', () => {
    const entry = getOrganizationActivityEntry('extortion')
    expect(entry?.label).toBe('Extortion')
    expect(getOrganizationActivityDiscoveryTerms('extortion')).toEqual(
      expect.arrayContaining(['coercion', 'intimidation']),
    )

    for (const rejected of [
      'theft',
      'assassination',
      'burglary',
      'fencing',
      'counterfeiting',
      'piracy',
      'robbery',
    ]) {
      expect(organizationActivitySchema.safeParse(rejected)).toMatchObject({ success: false })
    }
  })
})
