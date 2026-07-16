import { describe, expect, it } from 'vitest'

import {
  createDndBeyondEquipmentNameIndex,
  resolveLocalEquipmentFromName,
} from './dnd-beyond-equipment-mapping'

describe('dnd-beyond-equipment-mapping', () => {
  const index = createDndBeyondEquipmentNameIndex([
    { name: 'Backpack', slug: 'backpack' },
    { name: "Calligrapher's Supplies", slug: 'calligraphers-supplies' },
    { name: 'Dagger', slug: 'dagger' },
  ])

  it('resolves exact catalog names to local equipment ids', () => {
    expect(resolveLocalEquipmentFromName('Backpack', index)).toEqual({
      localSlug: 'backpack',
      localValue: 'srd-cc-5.2.1:backpack',
    })
  })

  it('falls back to the base name before parenthetical qualifiers', () => {
    expect(resolveLocalEquipmentFromName("Assassin's Blood (Ingested)", index)).toBeUndefined()
    expect(
      resolveLocalEquipmentFromName(
        "Assassin's Blood (Ingested)",
        createDndBeyondEquipmentNameIndex([{ name: "Assassin's Blood", slug: 'assassins-blood' }]),
      ),
    ).toEqual({
      localSlug: 'assassins-blood',
      localValue: 'srd-cc-5.2.1:assassins-blood',
    })
  })
})
