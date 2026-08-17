import { describe, expect, it } from 'vitest'

import {
  ORGANIZATION_FUNCTION_ENTRIES,
  ORGANIZATION_FUNCTION_IDS,
  getOrganizationFunctionEntry,
  organizationFunctionSchema,
} from './organization-function'

describe('Organization Function vocabulary', () => {
  it('keeps the registry narrow and schema-backed', () => {
    expect(ORGANIZATION_FUNCTION_IDS).toEqual([
      'worship',
      'ministry',
      'warfare',
      'defense',
      'finance',
      'education',
      'training',
      'research',
      'standards',
      'trade',
      'production',
      'transport',
      'administration',
      'governance',
      'advocacy',
      'policing',
      'care',
      'stewardship',
      'intelligence',
      'aid',
    ])
    expect(Object.keys(ORGANIZATION_FUNCTION_ENTRIES)).toEqual(ORGANIZATION_FUNCTION_IDS)
    expect(organizationFunctionSchema.parse('trade')).toBe('trade')
    expect(organizationFunctionSchema.parse('administration')).toBe('administration')
    expect(organizationFunctionSchema.parse('advocacy')).toBe('advocacy')
    expect(organizationFunctionSchema.parse('policing')).toBe('policing')
    expect(organizationFunctionSchema.parse('care')).toBe('care')
  })

  it('defines non-empty labels and descriptions', () => {
    for (const entry of Object.values(ORGANIZATION_FUNCTION_ENTRIES)) {
      expect(entry.label.trim()).not.toBe('')
      expect(entry.description.trim()).not.toBe('')
      expect(entry.memberTitles).toHaveLength(5)
    }
  })

  it('locks distinct descriptions for Function boundary pairs', () => {
    expect(getOrganizationFunctionEntry('governance')?.description).toContain('authority')
    expect(getOrganizationFunctionEntry('administration')?.description).toContain('bureaucratic')
    expect(getOrganizationFunctionEntry('policing')?.description).toContain('Enforcing order')
    expect(getOrganizationFunctionEntry('defense')?.description).toContain('Protecting')
    expect(getOrganizationFunctionEntry('care')?.description).toContain('bodily')
    expect(getOrganizationFunctionEntry('aid')?.description).toContain('material relief')
    expect(getOrganizationFunctionEntry('stewardship')?.description).toContain('Preserving')
    expect(getOrganizationFunctionEntry('research')?.description).toContain('inquiry')
    expect(getOrganizationFunctionEntry('intelligence')?.description).toContain('covert')
  })
})
