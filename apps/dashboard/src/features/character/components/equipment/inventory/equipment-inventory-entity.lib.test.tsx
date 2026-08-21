import { describe, expect, it } from 'vitest'

import { buildEquipmentInventoryRowEntity } from './equipment-inventory-entity.lib'

describe('buildEquipmentInventoryRowEntity', () => {
  it('maps inventory identity fields onto the entity summary model', () => {
    const entity = buildEquipmentInventoryRowEntity({
      equipmentName: 'Rations',
      detailLabel: '5 SP each · 1 GP total',
      equipped: true,
    })

    expect(entity.heading).toBe('Rations')
    expect(entity.description).toBeTruthy()
    expect(entity.status).toEqual([
      { kind: 'badge', label: 'Equipped', appearance: 'soft', tone: 'success' },
    ])
  })

  it('marks staged removal in the heading', () => {
    const entity = buildEquipmentInventoryRowEntity({
      equipmentName: 'Rations',
      detailLabel: 'Staged for removal',
      stagedRemoval: true,
    })

    expect(entity.heading).toBeTruthy()
    expect(entity.heading).not.toBe('Rations')
  })
})
