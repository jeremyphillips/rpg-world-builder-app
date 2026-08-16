import { describe, expect, it } from 'vitest'

import {
  ORGANIZATION_ACTIVITY_ENTRIES,
  ORGANIZATION_ACTIVITY_IDS,
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
    ])
    expect(Object.keys(ORGANIZATION_ACTIVITY_ENTRIES)).toEqual(ORGANIZATION_ACTIVITY_IDS)
    expect(organizationActivitySchema.parse('blacksmithing')).toBe('blacksmithing')
    expect(organizationActivitySchema.parse('banking')).toBe('banking')
    expect(organizationActivitySchema.parse('trade')).toBe('trade')
    expect(organizationActivitySchema.parse('administration')).toBe('administration')
    expect(organizationActivitySchema.safeParse('advocacy')).toMatchObject({ success: false })
  })

  it('defines non-empty labels and descriptions', () => {
    for (const entry of Object.values(ORGANIZATION_ACTIVITY_ENTRIES)) {
      expect(entry.label.trim()).not.toBe('')
      expect(entry.description.trim()).not.toBe('')
      expect(entry.memberTitles).toHaveLength(5)
    }
  })
})
