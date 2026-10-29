import { describe, expect, it } from 'vitest'

import {
  resolveMonsterCreateDefaultValues,
  type MonsterEquipmentFormEntry,
} from '../monster-form-values'
import {
  equipmentEntryHasMeaningfulCustomization,
  resolveEquipmentRemovalDecision,
} from './resolve-equipment-removal-decision.lib'

describe('equipmentEntryHasMeaningfulCustomization', () => {
  const base = { entryId: 'e1', equipmentId: 'dagger', quantity: 1 }

  it.each([
    [base, false],
    [{ ...base, magical: true }, false],
    [{ ...base, equipped: true, quantity: 3 }, false],
    [{ ...base, customName: '   ' }, false],
    [{ ...base, customDescription: '\n' }, false],
    [{ ...base, customName: 'Shard' }, true],
    [{ ...base, magicProperties: [{ kind: 'preset', propertyId: 'p1' }] }, true],
    [{ ...base, adjustments: [{ effectId: 'a1', target: 'attack_roll', bonus: 1 }] }, true],
    [{ ...base, modifiers: [{ kind: 'spellcasting_focus' }] }, true],
  ])('classifies %#', (entry, expected) => {
    expect(equipmentEntryHasMeaningfulCustomization(entry as MonsterEquipmentFormEntry)).toBe(
      expected,
    )
  })
})

describe('resolveEquipmentRemovalDecision', () => {
  const values = resolveMonsterCreateDefaultValues()

  it('requires no confirmation for a plain unreferenced row', () => {
    const entry = { entryId: 'plain', equipmentId: 'dagger', quantity: 1 }
    values.equipment = [entry]
    const decision = resolveEquipmentRemovalDecision(values, entry)
    expect(decision).toEqual({
      outcome: 'allowed',
      reasons: [],
      references: [],
    })
  })

  it('does not require confirmation for magical-only rows without properties', () => {
    const entry = { entryId: 'mag', equipmentId: 'dagger', quantity: 1, magical: true }
    values.equipment = [entry]
    const decision = resolveEquipmentRemovalDecision(values, entry)
    expect(decision.outcome).toBe('allowed')
    expect(decision.reasons).toEqual([])
  })

  it('orders customized before referenced', () => {
    const entry = {
      entryId: 'stack-a',
      equipmentId: 'dagger',
      quantity: 1,
      customName: 'Named',
    }
    values.equipment = [entry, { entryId: 'stack-b', equipmentId: 'dagger', quantity: 1 }]
    values.actions = [{ id: 'stab', kind: 'weapon', equipmentEntryId: 'stack-a', name: 'Stab' }]
    const decision = resolveEquipmentRemovalDecision(values, entry)
    expect(decision.outcome).toBe('confirm')
    expect(decision.reasons).toEqual(['customized', 'referenced'])
    expect(decision.references).toHaveLength(1)
  })

  it('scopes references to entryId when two stacks share equipmentId', () => {
    values.equipment = [
      { entryId: 'stack-a', equipmentId: 'dagger', quantity: 1 },
      { entryId: 'stack-b', equipmentId: 'dagger', quantity: 1 },
    ]
    values.actions = [{ id: 'stab', kind: 'weapon', equipmentEntryId: 'stack-b' }]
    const decision = resolveEquipmentRemovalDecision(values, {
      entryId: 'stack-a',
      equipmentId: 'dagger',
      quantity: 1,
    })
    expect(decision.outcome).toBe('allowed')
    expect(decision.references).toEqual([])
  })
})
