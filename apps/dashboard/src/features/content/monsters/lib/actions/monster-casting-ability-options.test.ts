import {
  resolveMonsterActionAttackProfile,
  type ResolveMonsterActionAttackProfileInput,
} from '@rpg/contracts'
import { isFieldOptionGroup } from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import {
  abilityAttackTrailingForAbility,
  monsterAttackAbilitySelectOptions,
  monsterCastingAbilitySelectOptions,
  spellAttackTrailingForAbility,
  spellSaveDcTrailingForAbility,
} from './monster-casting-ability-options'

function trailingText(
  options: ReturnType<typeof monsterAttackAbilitySelectOptions>,
  value: string,
): string | undefined {
  for (const item of options) {
    if (!isFieldOptionGroup(item)) continue
    const match = item.options.find((option) => option.value === value)
    if (match) return match.trailing?.text
  }
  return undefined
}

const scores = { str: 20, dex: 14, con: 12, int: 16, wis: 10, cha: 8 }

describe('monsterCastingAbilitySelectOptions', () => {
  it('puts shared sources ahead of common and other abilities', () => {
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
    const options = monsterCastingAbilitySelectOptions(values, 'step', 'save-dc')
    expect(options.map((group) => (isFieldOptionGroup(group) ? group.label : ''))).toEqual([
      "Use another action's ability",
      'Common abilities',
      'Other abilities',
    ])
    const other = options[2]
    expect(isFieldOptionGroup(other!) && other.options.map((option) => option.value)).toEqual([
      'str',
      'dex',
      'con',
    ])
  })

  it('derives spell save dc trailing from ability scores and challenge rating', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.challengeRating = '5'
    values.abilityScores.int = 16
    expect(spellSaveDcTrailingForAbility(values, 'int')).toEqual({
      text: 'DC 14',
      variant: 'strong',
    })
  })

  it('uses attack bonus trailing for a spell attack, including a shared source', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.challengeRating = '5'
    values.abilityScores = { ...values.abilityScores, ...scores }
    values.actions = [
      {
        id: 'spellcasting',
        kind: 'spell',
        name: 'Spellcasting',
        castingAbility: { kind: 'ability', ability: 'int' },
        spells: [],
      },
    ]
    const options = monsterCastingAbilitySelectOptions(values, 'bolt', 'attack-bonus')
    const profile = resolveMonsterActionAttackProfile({
      action: {
        id: 'bolt',
        kind: 'attack',
        name: 'Bolt',
        bonusSource: {
          kind: 'spellcasting',
          castingAbility: { kind: 'shared', entryId: 'spellcasting' },
        },
        damage: { dice: { count: 1, faces: 10 } },
        damageType: 'force',
      } as ResolveMonsterActionAttackProfileInput['action'],
      monster: {
        abilityScores: values.abilityScores,
        actions: values.actions,
      } as ResolveMonsterActionAttackProfileInput['monster'],
      equipmentCatalog: new Map(),
      proficiencyBonus: 3,
      magicPropertyProvider: () => undefined,
    })
    expect(profile.status).toBe('resolved')
    if (profile.status !== 'resolved') return
    expect(trailingText(options, 'shared:spellcasting')).toBe(
      `+${profile.value.attackBonus} to hit`,
    )
    expect(spellAttackTrailingForAbility(values, 'int')?.text).toBe(
      `+${profile.value.attackBonus} to hit`,
    )
  })

  it('omits trailing when challenge rating is unset', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.abilityScores.int = 16
    expect(spellSaveDcTrailingForAbility(values, 'int')).toBeUndefined()
    expect(spellAttackTrailingForAbility(values, 'int')).toBeUndefined()
  })
})

describe('monsterAttackAbilitySelectOptions', () => {
  it('orders strength and dexterity ahead of the other abilities', () => {
    const values = resolveMonsterCreateDefaultValues()
    const options = monsterAttackAbilitySelectOptions(values, true)
    expect(options.map((group) => (isFieldOptionGroup(group) ? group.label : ''))).toEqual([
      'Common abilities',
      'Other abilities',
    ])
    const [common, other] = options
    expect(isFieldOptionGroup(common!) && common.options.map((option) => option.value)).toEqual([
      'str',
      'dex',
    ])
    expect(isFieldOptionGroup(other!) && other.options.map((option) => option.value)).toEqual([
      'con',
      'int',
      'wis',
      'cha',
    ])
  })

  it('matches the resolved ability attack bonus and omits a preview without proficiency', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.challengeRating = '5'
    values.abilityScores = { ...values.abilityScores, ...scores }
    const options = monsterAttackAbilitySelectOptions(values, true)
    const profile = resolveMonsterActionAttackProfile({
      action: {
        id: 'slash',
        kind: 'attack',
        name: 'Slash',
        bonusSource: { kind: 'ability', ability: 'str', proficient: true },
        damage: { dice: { count: 1, faces: 8 } },
        damageType: 'slashing',
      } as ResolveMonsterActionAttackProfileInput['action'],
      monster: { abilityScores: values.abilityScores },
      equipmentCatalog: new Map(),
      proficiencyBonus: 3,
      magicPropertyProvider: () => undefined,
    })
    expect(profile.status).toBe('resolved')
    if (profile.status !== 'resolved') return
    expect(trailingText(options, 'str')).toBe(`+${profile.value.attackBonus} to hit`)
    expect(abilityAttackTrailingForAbility(values, 'str', undefined)).toBeUndefined()
    expect(
      trailingText(monsterAttackAbilitySelectOptions(values, undefined), 'dex'),
    ).toBeUndefined()
  })
})
