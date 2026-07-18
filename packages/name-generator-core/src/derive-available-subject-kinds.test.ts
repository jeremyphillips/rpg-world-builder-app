import { describe, expect, it } from 'vitest'

import type { NamingConvention } from '@rpg/contracts/name-generator'
import { ELVISH_PERSONAL_CONVENTION } from '@rpg/contracts/name-generator/test-fixtures'

import { deriveAvailableSubjectKinds } from './derive-available-subject-kinds'

const ELVISH_SETTLEMENT_CONVENTION = {
  ...ELVISH_PERSONAL_CONVENTION,
  id: 'elvish-settlement',
  subjectKinds: ['settlement', 'landmark'],
} as const satisfies NamingConvention

describe('deriveAvailableSubjectKinds', () => {
  it('unions subject kinds from conventions matching culture ids', () => {
    expect(
      deriveAvailableSubjectKinds({
        cultureIds: ['elven'],
        conventions: [ELVISH_PERSONAL_CONVENTION, ELVISH_SETTLEMENT_CONVENTION],
      }),
    ).toEqual(['person', 'settlement', 'landmark'])
  })

  it('deduplicates subject kinds in canonical order', () => {
    expect(
      deriveAvailableSubjectKinds({
        cultureIds: ['elven', 'elven'],
        conventions: [ELVISH_PERSONAL_CONVENTION],
      }),
    ).toEqual(['person'])
  })

  it('returns an empty array when no conventions match', () => {
    expect(
      deriveAvailableSubjectKinds({
        cultureIds: ['human'],
        conventions: [ELVISH_PERSONAL_CONVENTION],
      }),
    ).toEqual([])
  })

  it('resolves heritage target culture ids when matching conventions', () => {
    expect(
      deriveAvailableSubjectKinds({
        cultureIds: ['drow'],
        conventions: [ELVISH_PERSONAL_CONVENTION],
        resolveConventionCultureId: (cultureId) => (cultureId === 'drow' ? 'elven' : cultureId),
      }),
    ).toEqual(['person'])
  })
})
