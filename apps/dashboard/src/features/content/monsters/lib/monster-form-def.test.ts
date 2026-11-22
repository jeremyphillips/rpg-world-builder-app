import type { Monster } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { monsterFormDef } from './monster-form-def'

describe('monsterFormDef.extractEmbeddedSeedRowIds', () => {
  it('indexes legendary action ids under legendaryActions.actions', () => {
    const entity = {
      traits: [{ id: 't1' }],
      actions: [{ id: 'a1' }],
      bonusActions: [],
      reactions: [],
      legendaryActions: {
        uses: { normal: 3 },
        actions: [{ id: 'deathly-teleport' }, { id: 'disrupt-life' }],
      },
    } as Monster

    expect(monsterFormDef.extractEmbeddedSeedRowIds?.(entity)).toMatchObject({
      'legendaryActions.actions': ['deathly-teleport', 'disrupt-life'],
    })
    expect(
      monsterFormDef.extractEmbeddedSeedRowIds?.(entity) as Record<string, unknown>,
    ).not.toHaveProperty('legendaryActions')
  })
})
