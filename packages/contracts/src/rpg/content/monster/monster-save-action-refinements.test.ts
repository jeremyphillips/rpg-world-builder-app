import { describe, expect, it } from 'vitest'

import { createMonsterInputSchema } from '../monster'
import {
  BITE_ACTION,
  CONE_AREA,
  FIRE_DAMAGE,
  MONSTER_TEST_INPUT,
  issueMessages,
  monsterSaveAction,
} from './test-fixtures'

describe('monster save refinements', () => {
  it('accepts a multi-damage save and rejects an unknown preset id', () => {
    const cold = { ...FIRE_DAMAGE, id: 'cold', damageType: 'cold' }
    const parsed = createMonsterInputSchema.safeParse({
      ...MONSTER_TEST_INPUT,
      actions: [
        monsterSaveAction({
          selectionMode: 'self',
          areaOfEffect: CONE_AREA,
          method: { kind: 'saving-throw', ability: 'dex' },
          effects: [FIRE_DAMAGE, cold],
          outcomes: [
            {
              result: 'failed-save',
              applications: [
                { effectId: 'damage', amount: 'full' },
                { effectId: 'cold', amount: 'full' },
              ],
            },
          ],
        }),
        { ...BITE_ACTION, preset: 'not-in-the-registry' },
      ],
    })
    expect(issueMessages(parsed)).toContain('Unknown action preset.')
  })

  it('rejects unsupported save shapes', () => {
    const cases = [
      monsterSaveAction({
        selectionMode: 'point',
        origin: { proximity: { kind: 'distance', distance: { value: 30, unit: 'ft' } } },
        areaOfEffect: CONE_AREA,
        method: { kind: 'saving-throw', ability: 'dex' },
        effects: [FIRE_DAMAGE],
        outcomes: [
          { result: 'failed-save', applications: [{ effectId: 'damage', amount: 'full' }] },
        ],
      }),
      monsterSaveAction({
        selectionMode: 'none',
        method: { kind: 'saving-throw', ability: 'dex' },
        effects: [FIRE_DAMAGE],
        outcomes: [
          { result: 'failed-save', applications: [{ effectId: 'damage', amount: 'full' }] },
        ],
      }),
      monsterSaveAction({
        selectionMode: 'self',
        areaOfEffect: CONE_AREA,
        method: { kind: 'saving-throw', ability: 'dex' },
        effects: [{ id: 'healing', kind: 'healing', roll: { dice: { count: 1, faces: 8 } } }],
        outcomes: [
          { result: 'failed-save', applications: [{ effectId: 'healing', amount: 'full' }] },
        ],
      }),
      monsterSaveAction({
        selectionMode: 'self',
        areaOfEffect: CONE_AREA,
        method: { kind: 'saving-throw', ability: 'dex' },
        effects: [
          {
            id: 'temporary-hit-points',
            kind: 'temporary-hit-points',
            roll: { dice: { count: 1, faces: 4 } },
          },
        ],
        outcomes: [
          {
            result: 'failed-save',
            applications: [{ effectId: 'temporary-hit-points', amount: 'full' }],
          },
        ],
      }),
      monsterSaveAction({
        selectionMode: 'self',
        areaOfEffect: CONE_AREA,
        method: { kind: 'automatic' },
        effects: [FIRE_DAMAGE],
        outcomes: [{ result: 'applied', applications: [{ effectId: 'damage', amount: 'full' }] }],
      }),
    ]
    const messages = [
      'Saving throw actions select an area from self or creatures in reach or at a distance.',
      'Saving throw actions select an area from self or creatures in reach or at a distance.',
      'Saving throw actions can only deal damage.',
      'Saving throw actions can only deal damage.',
      'Saving throw actions require a saving throw.',
    ]
    cases.forEach((action, index) => {
      const parsed = createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [action],
      })
      expect(issueMessages(parsed)).toContain(messages[index])
    })
  })
})
