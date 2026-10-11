import { describe, expect, it } from 'vitest'

import { contentFormRegistry } from '../lib/forms/registry/content-form-registry'
import './lib/monster-form-def'
import { buildMonsterInput, resolveMonsterCreateDefaultValues } from './lib/monster-form-values'

describe('private monster form', () => {
  it('stays unregistered and round-trips traits and actions', () => {
    expect(contentFormRegistry.monsters).toBeUndefined()
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Scout'
    values.traits = [{ id: 'pack-tactics', name: 'Pack Tactics', description: 'Advantage.' }]
    values.equipment = [{ entryId: 'dagger-1', equipmentId: 'dagger', quantity: 1 }]
    values.actions = [
      { id: 'dagger', kind: 'weapon', equipmentEntryId: 'dagger-1', name: 'Dagger' },
    ]
    const input = buildMonsterInput(values, undefined, 'draft')
    expect(input.traits).toEqual(values.traits)
    expect(input.actions).toEqual(values.actions)
  })
})
