import { describe, expect, it } from 'vitest'

import type { CreatureFormsDraft } from '../creature/forms'
import {
  monsterFormRestrictionEligibleIds,
  readMonsterRowFormRestrictionIds,
} from './form-availability'

describe('monsterFormRestrictionEligibleIds', () => {
  it('includes the profile id only while the profile is the true form', () => {
    expect(
      monsterFormRestrictionEligibleIds({
        profileFormId: 'profile',
        trueForm: { kind: 'profile' },
        definedForms: [{ id: 'bear', name: 'Bear' }],
      })
        .slice()
        .sort(),
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
      })
        .slice()
        .sort(),
    ).toEqual(['bear', 'humanoid'])
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
      })
        .slice()
        .sort(),
    ).toEqual(['bear', 'humanoid'])
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

describe('readMonsterRowFormRestrictionIds', () => {
  it('returns undefined when the restriction key is absent', () => {
    expect(readMonsterRowFormRestrictionIds({ id: 'bite', kind: 'attack' })).toBeUndefined()
  })

  it('returns an empty list when the key is present with no ids', () => {
    expect(readMonsterRowFormRestrictionIds({ onlyInFormIds: [] })).toEqual([])
  })
})
