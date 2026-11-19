import { describe, expect, it } from 'vitest'

import type { CreatureFormsDraft } from '../creature/forms'
import {
  monsterFormRestrictionEligibleIds,
  monsterFormRestrictionLabelMap,
  readMonsterRowFormRestrictionIds,
  sortMonsterFormRestrictionIds,
} from './form-availability'

describe('monsterFormRestrictionEligibleIds', () => {
  it('includes the profile id only while the profile is the true form', () => {
    expect(
      monsterFormRestrictionEligibleIds({
        profileFormId: 'profile',
        trueForm: { kind: 'profile' },
        definedForms: [{ id: 'bear', name: 'Bear' }],
      }),
    ).toEqual(['bear', 'profile'])
  })

  it('lists defined forms only when a defined form is designated', () => {
    expect(
      monsterFormRestrictionEligibleIds({
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'humanoid' },
        definedForms: [
          { id: 'humanoid', name: 'Humanoid' },
          { id: 'bear', name: 'Bear' },
        ],
      }),
    ).toEqual(['humanoid', 'bear'])
  })

  it('includes every defined row while designation is incomplete', () => {
    expect(
      monsterFormRestrictionEligibleIds({
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: undefined },
        definedForms: [
          { id: 'humanoid', name: 'Humanoid' },
          { id: 'bear', name: 'Bear' },
        ],
      }),
    ).toEqual(['humanoid', 'bear'])
  })

  it('returns no ids when the forms draft is still partial', () => {
    expect(
      monsterFormRestrictionEligibleIds({
        profileFormId: 'profile',
        definedForms: [{ id: 'bear', name: 'Bear' }],
      } as CreatureFormsDraft),
    ).toEqual([])
  })
})

describe('sortMonsterFormRestrictionIds', () => {
  const forms = {
    profileFormId: 'profile',
    trueForm: { kind: 'defined', formId: 'humanoid' } as const,
    definedForms: [
      { id: 'humanoid', name: 'Humanoid' },
      { id: 'hybrid', name: 'Hybrid' },
      { id: 'bear', name: 'Bear' },
    ],
  } satisfies CreatureFormsDraft

  it('orders selected ids by defined-form list order', () => {
    expect(sortMonsterFormRestrictionIds(['bear', 'hybrid', 'humanoid'], forms)).toEqual([
      'humanoid',
      'hybrid',
      'bear',
    ])
  })

  it('trails ids that are not currently eligible', () => {
    expect(sortMonsterFormRestrictionIds(['stale', 'bear', 'humanoid'], forms)).toEqual([
      'humanoid',
      'bear',
      'stale',
    ])
  })
})

describe('monsterFormRestrictionLabelMap', () => {
  it('omits the profile id when a defined form is the true form', () => {
    const labels = monsterFormRestrictionLabelMap(
      {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'humanoid' },
        definedForms: [
          { id: 'humanoid', name: 'Humanoid' },
          { id: 'bear', name: '  ' },
        ],
      },
      'Werebear',
    )
    expect([...labels.entries()]).toEqual([
      ['humanoid', 'Humanoid'],
      ['bear', 'Untitled form'],
    ])
  })
})

describe('readMonsterRowFormRestrictionIds', () => {
  it('returns undefined when the restriction key is absent', () => {
    expect(readMonsterRowFormRestrictionIds({ id: 'bite', kind: 'attack' })).toBeUndefined()
  })

  it('returns an empty list when the key is present with no ids', () => {
    expect(readMonsterRowFormRestrictionIds({ onlyInFormIds: [] })).toEqual([])
  })
})
