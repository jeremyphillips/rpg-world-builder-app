import { describe, expect, it } from 'vitest'

import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import { collectMonsterActionSnapshotMissing } from './monster-action-row-snapshot.lib'

describe('collectMonsterActionSnapshotMissing', () => {
  it('flags nested resolution leaves dropped from the live row', () => {
    const snapshot = {
      ...resolveMonsterCreateDefaultValues(),
      reactions: [
        {
          id: 'shield',
          kind: 'spell',
          name: 'Protective Magic',
          castingAbility: { kind: 'ability', ability: 'int' },
          spells: [],
        },
      ],
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
    }
    expect(collectMonsterActionSnapshotMissing(snapshot, live)).toEqual([
      {
        path: 'reactions.0.castingAbility.ability',
        value: 'int',
      },
    ])
  })

  it('flags nested save resolution effects removed by registration', () => {
    const snapshot = {
      ...resolveMonsterCreateDefaultValues(),
      actions: [
        {
          id: 'breath',
          kind: 'save',
          name: 'Breath',
          resolution: {
            effects: [{ id: 'damage', kind: 'damage' }],
            method: { kind: 'saving-throw' },
            selectionMode: 'targets',
          },
        },
      ],
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
    }
    expect(collectMonsterActionSnapshotMissing(snapshot, live)).toEqual([
      {
        path: 'actions.0.resolution.effects',
        value: [{ id: 'damage', kind: 'damage' }],
      },
    ])
  })
})
