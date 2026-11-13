import { describe, expect, it } from 'vitest'

import { monsterActionSchema } from '../../content/monster/action'
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
            applications: [{ effectId: 'damage', amount: 'full' }],
          },
          {
            result: 'successful-save',
            applications: [{ effectId: 'damage', amount: 'half' }],
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
