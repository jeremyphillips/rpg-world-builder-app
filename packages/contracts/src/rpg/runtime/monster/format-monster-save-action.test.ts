import { describe, expect, it } from 'vitest'

import { monsterActionSchema } from '../../content/monster/action/index'
import { CONE_AREA } from '../../content/monster/test-fixtures'
import { formatMonsterSaveAction } from './format-monster-save-action'

const scores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }

describe('formatMonsterSaveAction target requirements', () => {
  it('prints a trample target in the saving throw sentence', () => {
    const parsed = monsterActionSchema.parse({
      id: 'trample',
      kind: 'save',
      name: 'Trample',
      dcSource: { kind: 'ability', ability: 'str', proficient: true },
      resolution: {
        selectionMode: 'targets',
        target: {
          count: 1,
          kind: 'creature',
          proximity: { kind: 'distance', distance: { value: 5, unit: 'ft' } },
          requirements: [{ kind: 'condition', presence: 'has', ids: ['prone'] }],
        },
        method: { kind: 'saving-throw', ability: 'dex' },
        effects: [
          {
            id: 'damage',
            kind: 'damage',
            roll: { dice: { count: 2, faces: 10 } },
            damageType: 'bludgeoning',
          },
        ],
        outcomes: [
          {
            result: 'failed-save',
            effects: [{ kind: 'effect-reference', effectId: 'damage', amount: 'full' }],
          },
          {
            result: 'successful-save',
            effects: [{ kind: 'effect-reference', effectId: 'damage', amount: 'half' }],
          },
        ],
      },
    })
    if (parsed.kind !== 'save') throw new Error('expected a save')
    const formatted = formatMonsterSaveAction({
      action: parsed,
      name: 'Trample',
      abilityScores: scores,
      proficiencyBonus: 3,
    })
    expect(formatted.body).toContain(
      'Dexterity Saving Throw: DC 11, one creature within 5 feet that has the Prone condition.',
    )
  })
})

describe('formatMonsterSaveAction save outcome extensions', () => {
  const scores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }

  it('keeps hell hound style damage breath without outcome effect duplication', () => {
    const parsed = monsterActionSchema.parse({
      id: 'fire-breath',
      kind: 'save',
      name: 'Fire Breath',
      dcSource: { kind: 'ability', ability: 'dex', proficient: true },
      resolution: {
        selectionMode: 'self',
        areaOfEffect: CONE_AREA,
        method: { kind: 'saving-throw', ability: 'dex' },
        effects: [
          {
            id: 'damage',
            kind: 'damage',
            roll: { dice: { count: 4, faces: 6 } },
            damageType: 'fire',
          },
        ],
        outcomes: [
          {
            result: 'failed-save',
            effects: [{ kind: 'effect-reference', effectId: 'damage', amount: 'full' }],
          },
          {
            result: 'successful-save',
            effects: [{ kind: 'effect-reference', effectId: 'damage', amount: 'half' }],
          },
        ],
      },
    })
    if (parsed.kind !== 'save') throw new Error('expected a save')
    const formatted = formatMonsterSaveAction({
      action: parsed,
      name: 'Fire Breath',
      abilityScores: scores,
      proficiencyBonus: 3,
    })
    expect(formatted.body).toBe(
      'Dexterity Saving Throw: DC 11, each creature in a 15-foot Cone. Failure: 14 (4d6) Fire damage. Success: Half damage.',
    )
  })

  it('renders repeat save labels and condition replacement', () => {
    const parsed = monsterActionSchema.parse({
      id: 'petrifying-breath',
      kind: 'save',
      name: 'Petrifying Breath',
      dcSource: { kind: 'ability', ability: 'con', proficient: true },
      resolution: {
        selectionMode: 'self',
        areaOfEffect: { ...CONE_AREA, length: { value: 30, unit: 'ft' } },
        method: { kind: 'saving-throw', ability: 'con' },
        effects: [],
        outcomes: [
          {
            result: 'failed-save',
            effects: [{ kind: 'condition', conditionId: 'restrained' }],
            repeatSave: {
              timing: { participant: 'target', boundary: 'end', which: 'next' },
              secondFailure: {
                effects: [
                  {
                    kind: 'condition',
                    conditionId: 'petrified',
                    replacesConditionId: 'restrained',
                  },
                ],
              },
            },
          },
          { result: 'successful-save', effects: [] },
        ],
      },
    })
    if (parsed.kind !== 'save') throw new Error('expected a save')
    const formatted = formatMonsterSaveAction({
      action: parsed,
      name: 'Petrifying Breath',
      abilityScores: scores,
      proficiencyBonus: 3,
    })
    expect(formatted.body).toContain('First Failure:')
    expect(formatted.body).toContain('At the end of its next turn, it repeats the saving throw.')
    expect(formatted.body).toContain(
      'The target has the Petrified condition instead of the Restrained condition.',
    )
    expect(formatted.body).toContain('Second Failure:')
  })

  it('renders failure or success and keeps envelope-only saves compact', () => {
    const underwater = monsterActionSchema.parse({
      id: 'fire-breath-rider',
      kind: 'save',
      name: 'Fire Breath',
      dcSource: { kind: 'ability', ability: 'dex', proficient: true },
      resolution: {
        selectionMode: 'self',
        areaOfEffect: CONE_AREA,
        method: { kind: 'saving-throw', ability: 'dex' },
        effects: [
          {
            id: 'damage',
            kind: 'damage',
            roll: { dice: { count: 4, faces: 6 } },
            damageType: 'fire',
          },
        ],
        outcomes: [
          {
            result: 'failed-save',
            effects: [{ kind: 'effect-reference', effectId: 'damage', amount: 'full' }],
          },
          {
            result: 'successful-save',
            effects: [{ kind: 'effect-reference', effectId: 'damage', amount: 'half' }],
          },
          {
            result: 'failed-or-successful-save',
            effects: [
              {
                kind: 'note',
                description: "Being underwater doesn't grant Resistance to this Fire damage.",
              },
            ],
          },
        ],
      },
    })
    if (underwater.kind !== 'save') throw new Error('expected save')
    const formatted = formatMonsterSaveAction({
      action: underwater,
      name: 'Fire Breath',
      abilityScores: scores,
      proficiencyBonus: 3,
    })
    expect(formatted.body).toContain('Failure or Success:')
    expect(formatted.body).toContain("Being underwater doesn't grant Resistance")
  })

  it('joins consecutive damage with plus and phrases mixed success amounts per definition', () => {
    const parsed = monsterActionSchema.parse({
      id: 'constrict',
      kind: 'save',
      name: 'Constrict',
      dcSource: { kind: 'ability', ability: 'str', proficient: true },
      resolution: {
        selectionMode: 'targets',
        target: {
          count: 1,
          kind: 'creature',
          proximity: { kind: 'reach', distance: { value: 5, unit: 'ft' } },
        },
        method: { kind: 'saving-throw', ability: 'str' },
        effects: [
          {
            id: 'bludgeoning',
            kind: 'damage',
            roll: { dice: { count: 2, faces: 6 }, flat: 4 },
            damageType: 'bludgeoning',
          },
          {
            id: 'fire-full',
            kind: 'damage',
            roll: { dice: { count: 2, faces: 6 } },
            damageType: 'fire',
          },
          {
            id: 'fire-half',
            kind: 'damage',
            roll: { dice: { count: 1, faces: 6 } },
            damageType: 'fire',
          },
        ],
        outcomes: [
          {
            result: 'failed-save',
            effects: [
              { kind: 'effect-reference', effectId: 'bludgeoning', amount: 'full' },
              { kind: 'effect-reference', effectId: 'fire-full', amount: 'full' },
              { kind: 'effect-reference', effectId: 'fire-half', amount: 'full' },
            ],
          },
          {
            result: 'successful-save',
            effects: [
              { kind: 'effect-reference', effectId: 'bludgeoning', amount: 'none' },
              { kind: 'effect-reference', effectId: 'fire-full', amount: 'full' },
              { kind: 'effect-reference', effectId: 'fire-half', amount: 'half' },
            ],
          },
        ],
      },
    })
    if (parsed.kind !== 'save') throw new Error('expected a save')
    const formatted = formatMonsterSaveAction({
      action: parsed,
      name: 'Constrict',
      abilityScores: scores,
      proficiencyBonus: 2,
    })
    expect(formatted.body).toContain(
      'Failure: 11 (2d6 + 4) Bludgeoning damage plus 7 (2d6) Fire damage plus 3 (1d6) Fire damage.',
    )
    expect(formatted.body).toContain(
      'Success: 7 (2d6) Fire damage plus half of 3 (1d6) Fire damage.',
    )
    expect(formatted.body).not.toContain('Success: No damage')
  })

  it('omits a success sentence when every damage reference is none', () => {
    const parsed = monsterActionSchema.parse({
      id: 'bite',
      kind: 'save',
      name: 'Bite',
      dcSource: { kind: 'ability', ability: 'str', proficient: true },
      resolution: {
        selectionMode: 'targets',
        target: {
          count: 1,
          kind: 'creature',
          proximity: { kind: 'reach' },
        },
        method: { kind: 'saving-throw', ability: 'con' },
        effects: [
          {
            id: 'piercing',
            kind: 'damage',
            roll: { dice: { count: 1, faces: 4 }, flat: 4 },
            damageType: 'piercing',
          },
        ],
        outcomes: [
          {
            result: 'failed-save',
            effects: [{ kind: 'effect-reference', effectId: 'piercing', amount: 'full' }],
          },
          {
            result: 'successful-save',
            effects: [{ kind: 'effect-reference', effectId: 'piercing', amount: 'none' }],
          },
        ],
      },
    })
    if (parsed.kind !== 'save') throw new Error('expected a save')
    const formatted = formatMonsterSaveAction({
      action: parsed,
      name: 'Bite',
      abilityScores: scores,
      proficiencyBonus: 2,
    })
    expect(formatted.body).not.toContain('Success:')
  })
})
