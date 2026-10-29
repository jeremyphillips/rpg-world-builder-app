import { describe, expect, it } from 'vitest'

import { ARMOR_CLASS_RULES_MATRIX } from '../../vocab/mechanics/armor-class-scale'
import {
  resolveCreatureArmorClass,
  type EquippedArmorPiece,
  type ResolveCreatureArmorClassInput,
} from './armor-class'

const light: EquippedArmorPiece = {
  category: 'light',
  baseAcOffset: 1,
  acAdjustment: 0,
  entryId: 'leather',
  label: 'Leather',
}

const medium: EquippedArmorPiece = {
  category: 'medium',
  baseAcOffset: 2,
  acAdjustment: 0,
  entryId: 'hide',
  label: 'Hide',
}

const shield: EquippedArmorPiece = {
  category: 'shields',
  acBonus: 2,
  acAdjustment: 1,
  entryId: 'shield',
  label: 'Shield',
  enhancementLabel: '+1',
}

function sumRows(rows: readonly { value: number }[]): number {
  return rows.reduce((total, row) => total + row.value, 0)
}

describe('resolveCreatureArmorClass', () => {
  it('keeps row invariants across the rules matrix', () => {
    for (const rules of ARMOR_CLASS_RULES_MATRIX) {
      const input: ResolveCreatureArmorClassInput = {
        rules,
        dexModifier: 3,
        bodyArmor: medium,
        shields: [shield],
        naturalArmorBonus: 2,
        eligibility: { skinCompetesWithArmor: true },
      }
      const calculated = resolveCreatureArmorClass(input)
      expect(sumRows(calculated.rows)).toBe(calculated.ac)
      expect(calculated.rows.filter((row) => row.kind === 'ruleset-base')).toHaveLength(
        calculated.source === 'armor' ? 0 : 1,
      )
      const shieldDelta = calculated.rows
        .filter(
          (row) => row.kind === 'shield' || (row.kind === 'enhancement' && row.target === 'shield'),
        )
        .reduce((total, row) => total + row.value, 0)
      for (const alternative of calculated.alternatives.status === 'resolved'
        ? calculated.alternatives.value
        : []) {
        const withoutShield = resolveCreatureArmorClass({ ...input, shields: [] })
        const body =
          withoutShield.source === alternative.source
            ? withoutShield.ac
            : withoutShield.alternatives.status === 'resolved'
              ? withoutShield.alternatives.value.find((row) => row.source === alternative.source)
                  ?.ac
              : undefined
        expect(alternative.ac).toBe((body ?? 0) + shieldDelta)
      }

      const fixed = resolveCreatureArmorClass({ ...input, fixedAcOffset: -2 })
      expect(sumRows(fixed.rows)).toBe(fixed.ac)
      expect(fixed.calculatedAc).toEqual({ status: 'resolved', value: calculated.ac })
      expect(fixed.dexRestriction).toBeUndefined()
      expect(fixed.rows).toEqual([{ kind: 'fixed', value: fixed.ac }])
    }
  })

  it('keeps character armor from competing with unarmored skin', () => {
    const ruled = ARMOR_CLASS_RULES_MATRIX[0]
    const armored = resolveCreatureArmorClass({
      rules: ruled,
      dexModifier: 5,
      bodyArmor: { ...light, baseAcOffset: 1 },
      shields: [],
      eligibility: { skinCompetesWithArmor: false },
    })
    expect(armored.source).toBe('armor')
    expect(armored.alternatives).toEqual({ status: 'resolved', value: [] })
  })

  it('treats a natural bonus of 0 as natural and lets equal armor win the tie', () => {
    const rules = ARMOR_CLASS_RULES_MATRIX[0]
    const natural = resolveCreatureArmorClass({
      rules,
      dexModifier: 2,
      shields: [],
      naturalArmorBonus: 0,
      eligibility: { skinCompetesWithArmor: true },
    })
    const unarmored = resolveCreatureArmorClass({
      rules,
      dexModifier: 2,
      shields: [],
      eligibility: { skinCompetesWithArmor: true },
    })
    expect(natural.source).toBe('natural')
    expect(natural.ac).toBe(unarmored.ac)

    const tied = resolveCreatureArmorClass({
      rules,
      dexModifier: 0,
      naturalArmorBonus: 1,
      bodyArmor: light,
      shields: [],
      eligibility: { skinCompetesWithArmor: true },
    })
    expect(tied.source).toBe('armor')
    expect(tied.tie).toBe(true)
  })

  it('picks the same winner in both directions', () => {
    const ascending = resolveCreatureArmorClass({
      rules: { mode: 'ascending', base: 10 },
      dexModifier: 1,
      naturalArmorBonus: 4,
      bodyArmor: medium,
      shields: [shield],
      eligibility: { skinCompetesWithArmor: true },
    })
    const descending = resolveCreatureArmorClass({
      rules: { mode: 'descending', base: 10 },
      dexModifier: 1,
      naturalArmorBonus: 4,
      bodyArmor: medium,
      shields: [shield],
      eligibility: { skinCompetesWithArmor: true },
    })
    expect(descending.source).toBe(ascending.source)
    expect(descending.tie).toBe(ascending.tie)
    expect(descending.ac).not.toBe(ascending.ac)
  })

  it('stacks character shields and omits calculated rows from a fixed override', () => {
    const resolved = resolveCreatureArmorClass({
      rules: { mode: 'ascending', base: 10 },
      dexModifier: 1,
      shields: [shield, { ...shield, entryId: 'shield-2', acBonus: 1, acAdjustment: 0 }],
      eligibility: { skinCompetesWithArmor: false },
    })
    expect(resolved.ac).toBe(15)
    expect(resolved.rows.filter((row) => row.kind === 'shield')).toHaveLength(2)

    const fixed = resolveCreatureArmorClass({
      rules: { mode: 'ascending', base: 10 },
      fixedAcOffset: 5,
      eligibility: { skinCompetesWithArmor: true },
    })
    expect(fixed.ac).toBe(15)
    expect(fixed.calculatedAc).toBeUndefined()
    expect(fixed.alternatives).toEqual({ status: 'resolved', value: [] })
  })
})
