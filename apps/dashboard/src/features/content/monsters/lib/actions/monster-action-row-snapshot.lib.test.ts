import { describe, expect, it } from 'vitest'

import { monsterFormTestValues } from '../monster-form-test-values'
import type { MonsterFormValues } from '../monster-form-values'
import { collectMonsterActionSnapshotMissing } from './monster-action-row-snapshot.lib'

describe('collectMonsterActionSnapshotMissing', () => {
  it('flags nested resolution leaves dropped from the live row', () => {
    const snapshot = {
      ...monsterFormTestValues({
        name: 'Snapshot shield',
        reactions: [
          {
            id: 'shield',
            kind: 'spell',
            name: 'Protective Magic',
            castingAbility: { kind: 'ability', ability: 'int' },
            spells: [],
          },
        ],
      }),
    }
    const live = {
      ...snapshot,
      reactions: [
        {
          id: 'shield',
          kind: 'spell',
          name: 'Protective Magic',
          castingAbility: { kind: 'ability' },
          spells: [],
        },
      ],
    } as unknown as MonsterFormValues
    expect(collectMonsterActionSnapshotMissing(snapshot, live)).toEqual([
      {
        path: 'reactions.0.castingAbility.ability',
        value: 'int',
      },
    ])
  })

  it('flags nested save resolution effects removed by registration', () => {
    const snapshot = {
      ...monsterFormTestValues({
        name: 'Snapshot breath',
        actions: [
          {
            id: 'breath',
            kind: 'save',
            name: 'Breath',
            resolution: {
              effects: [{ id: 'damage', kind: 'damage' }],
              method: { kind: 'saving-throw', ability: 'con' },
              selectionMode: 'targets',
            },
          },
        ] as unknown as MonsterFormValues['actions'],
      }),
    }
    const live = {
      ...snapshot,
      actions: [
        {
          id: 'breath',
          kind: 'save',
          name: 'Breath',
          resolution: {
            method: { kind: 'saving-throw' },
            selectionMode: 'targets',
          },
        },
      ],
    } as unknown as MonsterFormValues
    expect(collectMonsterActionSnapshotMissing(snapshot, live)).toEqual([
      {
        path: 'actions.0.resolution.effects',
        value: [{ id: 'damage', kind: 'damage' }],
      },
    ])
  })
})
