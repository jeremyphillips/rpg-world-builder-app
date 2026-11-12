import { abilitySaveDc } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import {
  monsterCastingAbilitySelectOptions,
  spellSaveDcTrailingForAbility,
} from './monster-casting-ability-options'

describe('monsterCastingAbilitySelectOptions', () => {
  it('puts shared sources above direct abilities when present', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.challengeRating = '5'
    values.abilityScores.int = 16
    values.actions = [
      {
        id: 'spellcasting',
        kind: 'spell',
        name: 'Spellcasting',
        castingAbility: { kind: 'ability', ability: 'int' },
        spells: [],
      },
    ]
    values.bonusActions = [
      {
        id: 'step',
        kind: 'spell',
        name: 'Misty Step',
        castingAbility: { kind: 'shared', entryId: 'spellcasting' },
        spells: [],
      },
    ]
    const options = monsterCastingAbilitySelectOptions(values, 'step')
    expect(options[0]).toMatchObject({ kind: 'group', label: "Use another action's ability" })
    expect(options[1]).toMatchObject({ kind: 'group', label: 'Choose an ability' })
  })

  it('derives spell save dc trailing from ability scores and challenge rating', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.challengeRating = '5'
    values.abilityScores.int = 16
    const trailing = spellSaveDcTrailingForAbility(values, 'int')
    expect(trailing).toEqual({
      text: `DC ${abilitySaveDc(16, 3)}`,
      variant: 'strong',
    })
  })

  it('omits trailing when challenge rating is unset', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.abilityScores.int = 16
    expect(spellSaveDcTrailingForAbility(values, 'int')).toBeUndefined()
  })
})
