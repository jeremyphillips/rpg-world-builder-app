import { describe, expect, it } from 'vitest'

import { ORGANIZATION_PRACTICE_IDS } from './organization-practice'
import {
  ORGANIZATION_PRACTICE_PRESENTATION_FAMILIES,
  ORGANIZATION_PRACTICE_PRESENTATION_FAMILY_BY_ID,
  getOrganizationPracticePresentationFamily,
} from './organization-practice-presentation-family'

describe('Organization Practice presentation families', () => {
  it('assigns exactly one UI-only family to every practice id', () => {
    expect(Object.keys(ORGANIZATION_PRACTICE_PRESENTATION_FAMILY_BY_ID).sort()).toEqual(
      [...ORGANIZATION_PRACTICE_IDS].sort(),
    )

    for (const id of ORGANIZATION_PRACTICE_IDS) {
      const family = getOrganizationPracticePresentationFamily(id)
      expect(ORGANIZATION_PRACTICE_PRESENTATION_FAMILIES).toContain(family)
    }
  })
})
