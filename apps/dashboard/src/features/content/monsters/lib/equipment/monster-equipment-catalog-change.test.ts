import { describe, expect, it } from 'vitest'
import type { Equipment } from '@rpg/contracts'

import { planEquipmentCatalogChange } from './monster-equipment-catalog-change'
import {
  findActionsReferencingEntry,
  removeEquipmentEntryWithDependents,
} from '../actions/monster-action-equipment-references'
import { equipmentEntryReferenceLabel } from './monster-equipment-labels'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'

const dagger = { id: 'dagger', kind: 'weapon', name: 'Dagger' } as Equipment
const bow = { id: 'bow', kind: 'weapon', name: 'Shortbow' } as Equipment
const armor = { id: 'chain', kind: 'armor', name: 'Chain Shirt', category: 'light' } as Equipment
const shield = { id: 'shield', kind: 'armor', name: 'Shield', category: 'shields' } as Equipment
const rope = { id: 'rope', kind: 'adventuring_gear', name: 'Rope' } as unknown as Equipment

describe('monster equipment catalog changes', () => {
  it('finds references in every section and removes them with the row', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.equipment = [{ entryId: 'dagger-1', equipmentId: 'dagger', quantity: 1 }]
    values.actions = [{ id: 'stab', kind: 'weapon', equipmentEntryId: 'dagger-1', name: 'Stab' }]
    values.reactions = [{ id: 'parry', kind: 'weapon', equipmentEntryId: 'dagger-1' }]

    expect(findActionsReferencingEntry(values, 'dagger-1')).toEqual([
      { section: 'actions', id: 'stab', name: 'Stab' },
      { section: 'reactions', id: 'parry', name: undefined },
    ])
    const removed = removeEquipmentEntryWithDependents(values, 'dagger-1')
    expect(removed.equipment).toEqual([])
    expect(removed.actions).toEqual([])
    expect(removed.reactions).toEqual([])
  })

  it('keeps weapon references on a weapon swap and confirms a non-weapon swap', () => {
    const values = resolveMonsterCreateDefaultValues()
    const entry = { entryId: 'dagger-1', equipmentId: 'dagger', quantity: 2, customName: 'Shard' }
    values.equipment = [entry]
    values.actions = [
      { id: 'stab', kind: 'weapon', equipmentEntryId: 'dagger-1', name: 'Stab' },
      { id: 'quick', kind: 'weapon', equipmentEntryId: 'dagger-1', name: 'Quick Stab' },
    ]

    const swapped = planEquipmentCatalogChange(values, entry, bow, 'Shortbow')
    expect(swapped.outcome).toBe('apply')
    if (swapped.outcome !== 'apply') return
    expect(swapped.entry.entryId).toBe('dagger-1')
    expect(swapped.entry.quantity).toBe(2)
    expect(swapped.entry.customName).toBe('Shard')
    expect(swapped.retarget?.actionNames).toEqual(['Stab', 'Quick Stab'])

    const blocked = planEquipmentCatalogChange(values, entry, rope, 'Rope')
    expect(blocked.outcome).toBe('confirm')
  })

  it('keeps an armor adjustment across armor and confirms clearing it', () => {
    const values = resolveMonsterCreateDefaultValues()
    const entry = {
      entryId: 'armor-1',
      equipmentId: 'chain',
      quantity: 1,
      equipped: true,
      modifiers: [{ kind: 'armor_class' as const, bonus: -1 }],
    }
    const nextArmor = planEquipmentCatalogChange(values, entry, shield, 'Shield')
    expect(nextArmor.outcome).toBe('apply')
    if (nextArmor.outcome === 'apply') {
      expect(nextArmor.entry.modifiers).toEqual([{ kind: 'armor_class', bonus: -1 }])
      expect(nextArmor.entry.equipped).toBe(true)
    }
    const cleared = planEquipmentCatalogChange(values, entry, rope, 'Rope')
    expect(cleared).toMatchObject({ outcome: 'confirm', reason: 'clear-adjustment' })
  })

  it('disambiguates duplicate catalog names', () => {
    const catalog = new Map<string, Equipment>([['dagger', dagger]])
    const entries = [
      { entryId: 'a', equipmentId: 'dagger', quantity: 1 },
      { entryId: 'b', equipmentId: 'dagger', quantity: 1 },
    ]
    expect(equipmentEntryReferenceLabel(entries[0]!, entries, catalog)).toBe('Dagger (1)')
    expect(equipmentEntryReferenceLabel(entries[1]!, entries, catalog)).toBe('Dagger (2)')
  })

  it('uses the real dagger and armor fixtures only as types', () => {
    expect(armor.kind).toBe('armor')
  })
})
