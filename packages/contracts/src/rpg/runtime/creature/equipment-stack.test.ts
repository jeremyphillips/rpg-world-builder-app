import { describe, expect, it } from 'vitest'

import {
  findCanonicalPlainEntry,
  isPlainEquipmentEntry,
  splitEquipmentEntry,
  summarizeEquipmentStacks,
} from './equipment-stack'

describe('equipment stack helpers', () => {
  it('detects plain entries and skips customized stacks for canonical lookup', () => {
    const entries = [
      { entryId: 'a', equipmentId: 'dagger', quantity: 2, magical: true },
      { entryId: 'b', equipmentId: 'dagger', quantity: 3 },
    ]
    expect(isPlainEquipmentEntry(entries[1]!)).toBe(true)
    expect(findCanonicalPlainEntry(entries, 'dagger')?.entryId).toBe('b')
  })

  it('splits one copy while preserving total quantity and list order', () => {
    const entries = [
      { entryId: 'src', equipmentId: 'dagger', quantity: 3, equipped: true },
      { entryId: 'other', equipmentId: 'sword', quantity: 1 },
    ]
    const next = splitEquipmentEntry(entries, 'src', {
      newEntryId: 'split',
      patch: { magical: true, quantity: 1 },
    })
    expect(next.map((row) => row.entryId)).toEqual(['src', 'split', 'other'])
    expect(next[0]).toMatchObject({ entryId: 'src', quantity: 2, equipped: true })
    expect(next[1]).toMatchObject({ entryId: 'split', quantity: 1, magical: true, equipped: true })
  })

  it('summarizes customized copy counts by quantity, not row count', () => {
    const summary = summarizeEquipmentStacks([
      { entryId: 'plain', equipmentId: 'dagger', quantity: 2 },
      { entryId: 'custom', equipmentId: 'dagger', quantity: 1, magical: true },
    ]).get('dagger')
    expect(summary).toEqual({
      ownedQuantity: 3,
      plainEntryId: 'plain',
      plainQuantity: 2,
      customizedCopyCount: 1,
    })
  })
})
