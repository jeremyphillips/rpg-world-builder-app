import { describe, expect, it } from 'vitest'

import {
  ELVISH_FAMILY_COLLECTION,
  ELVISH_GIVEN_COLLECTION,
  ELVISH_PERSONAL_CONVENTION,
  FACTION_CONVENTION,
  FACTION_DESCRIPTOR_COLLECTION,
  FACTION_TYPE_COLLECTION,
} from '@rpg/contracts/name-generator/test-fixtures'
import { recommendConventions } from './recommend-conventions'

describe('recommendConventions', () => {
  const conventions = [ELVISH_PERSONAL_CONVENTION, FACTION_CONVENTION]

  it('scores selected elven culture conventions', () => {
    const recommendations = recommendConventions(
      {
        subjectKind: 'person',
        languageIds: ['elvish'],
        cultureIds: ['elven'],
        conventionCultureIds: ['elven'],
        cultureResolutions: { elven: 'elven' },
      },
      conventions,
    )

    expect(recommendations[0]?.conventionId).toBe('elvish-personal')
    expect(recommendations[0]?.reasons).toContainEqual({
      kind: 'culture',
      cultureId: 'elven',
      strength: 'primary',
    })
  })

  it('ranks language-primary conventions above tag-only matches', () => {
    const recommendations = recommendConventions(
      {
        subjectKind: 'person',
        languageIds: ['elvish'],
        cultureIds: ['elven'],
      },
      conventions,
    )

    expect(recommendations[0]?.conventionId).toBe('elvish-personal')
    expect(recommendations[0]?.score).toBeGreaterThan(recommendations[1]?.score ?? 0)
  })

  it('surfaces faction conventions via tags', () => {
    const recommendations = recommendConventions(
      { subjectKind: 'faction', tags: ['guild'] },
      conventions,
    )

    expect(recommendations.some((item) => item.conventionId === 'faction-general')).toBe(true)
  })

  it('orders ties deterministically by convention id', () => {
    const duplicate = {
      ...FACTION_CONVENTION,
      id: 'aaa-faction',
      label: 'AAA Faction',
    }
    const recommendations = recommendConventions({ subjectKind: 'faction', tags: ['guild'] }, [
      FACTION_CONVENTION,
      duplicate,
    ])

    expect(recommendations.map((item) => item.conventionId)).toEqual([
      'aaa-faction',
      'faction-general',
    ])
  })

  it('omits zero-score conventions', () => {
    const recommendations = recommendConventions({ subjectKind: 'ship' }, conventions)

    expect(recommendations).toHaveLength(0)
  })
})

export const ELVISH_COLLECTIONS = new Map([
  ['elvish-given-pool', ELVISH_GIVEN_COLLECTION],
  ['elvish-family-pool', ELVISH_FAMILY_COLLECTION],
])

export const FACTION_COLLECTIONS = new Map([
  ['faction-descriptor-pool', FACTION_DESCRIPTOR_COLLECTION],
  ['faction-org-type-pool', FACTION_TYPE_COLLECTION],
])
