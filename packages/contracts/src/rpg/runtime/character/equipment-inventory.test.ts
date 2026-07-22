import { describe, expect, it } from 'vitest'

import { EQUIPMENT_KINDS } from '../../vocab/equipment/kind'
import {
  CHARACTER_EQUIPMENT_INVENTORY_BUCKETS,
  EQUIPMENT_KIND_TO_INVENTORY_BUCKET,
  characterEquipmentSchema,
  inventoryBucketForEquipmentKind,
} from './equipment-inventory'

describe('character equipment inventory mapping', () => {
  it('lists every characterEquipmentSchema bucket key', () => {
    expect([...CHARACTER_EQUIPMENT_INVENTORY_BUCKETS].sort()).toEqual(
      Object.keys(characterEquipmentSchema.shape).sort(),
    )
  })

  it('maps every equipment kind to an inventory bucket', () => {
    expect(Object.keys(EQUIPMENT_KIND_TO_INVENTORY_BUCKET).sort()).toEqual(
      [...EQUIPMENT_KINDS].sort(),
    )

    for (const kind of EQUIPMENT_KINDS) {
      expect(inventoryBucketForEquipmentKind(kind)).toBe(EQUIPMENT_KIND_TO_INVENTORY_BUCKET[kind])
    }
  })

  it('maps adventuring gear and services into the gear bucket', () => {
    expect(EQUIPMENT_KIND_TO_INVENTORY_BUCKET.adventuring_gear).toBe('gear')
    expect(EQUIPMENT_KIND_TO_INVENTORY_BUCKET.service).toBe('gear')
  })

  it('maps only to known inventory buckets', () => {
    for (const bucket of Object.values(EQUIPMENT_KIND_TO_INVENTORY_BUCKET)) {
      expect(CHARACTER_EQUIPMENT_INVENTORY_BUCKETS).toContain(bucket)
    }
  })
})
