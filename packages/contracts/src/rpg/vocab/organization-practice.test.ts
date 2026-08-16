import { describe, expect, it } from 'vitest'

import {
  ORGANIZATION_PRACTICE_ENTRIES,
  ORGANIZATION_PRACTICE_IDS,
  getOrganizationPracticeDiscoveryTerms,
  getOrganizationPracticeEntry,
  organizationPracticeSchema,
} from './organization-practice'

describe('Organization Practice vocabulary', () => {
  it('keeps the registry narrow and schema-backed', () => {
    expect(ORGANIZATION_PRACTICE_IDS).toEqual([
      'blacksmithing',
      'brewing',
      'banking',
      'apprenticeship',
      'smuggling',
      'extortion',
    ])
    expect(Object.keys(ORGANIZATION_PRACTICE_ENTRIES)).toEqual(ORGANIZATION_PRACTICE_IDS)
    expect(organizationPracticeSchema.parse('blacksmithing')).toBe('blacksmithing')
    expect(organizationPracticeSchema.parse('banking')).toBe('banking')
    expect(organizationPracticeSchema.parse('brewing')).toBe('brewing')
  })

  it('defines non-empty labels and descriptions', () => {
    for (const entry of Object.values(ORGANIZATION_PRACTICE_ENTRIES)) {
      expect(entry.label.trim()).not.toBe('')
      expect(entry.description.trim()).not.toBe('')
      expect(entry.memberTitles).toHaveLength(5)
    }
  })

  it('admits extortion as a sustained organizational practice without opening the crime catalog', () => {
    const entry = getOrganizationPracticeEntry('extortion')
    expect(entry?.label).toBe('Extortion')
    expect(getOrganizationPracticeDiscoveryTerms('extortion')).toEqual(
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
      expect(organizationPracticeSchema.safeParse(rejected)).toMatchObject({ success: false })
    }
  })
})
