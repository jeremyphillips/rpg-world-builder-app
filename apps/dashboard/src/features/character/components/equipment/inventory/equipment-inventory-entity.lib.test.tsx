import { describe, expect, it } from 'vitest'

import type { EquipmentInventoryRow } from '../../../lib/equipment/equipment-step.lib'
import {
  buildEquipmentInventoryRowEntity,
  resolveInventoryRowTrailingMeta,
} from './equipment-inventory-entity.lib'

const rationsRow: EquipmentInventoryRow = {
  group: 'gear',
  groupLabel: 'Gear',
  entry: {
    equipmentId: 'srd-cc-5.2.1:rations',
    quantity: 2,
    equipped: true,
    sources: [{ kind: 'startingGold' }],
  },
  equipmentName: 'Rations',
  sourceLabel: 'Purchased with starting gold',
  isStackable: true,
  quantityMode: 'editable',
  priceLineLabel: '5 SP each · 1 GP total',
  removeLabel: 'Remove all 2 Rations',
}

describe('buildEquipmentInventoryRowEntity', () => {
  it('maps the name and selection status as one metadata line without an Equipped badge', () => {
    const status = [
      { kind: 'badge', label: 'Not proficient', tone: 'warning', appearance: 'soft' },
    ] as const
    const entity = buildEquipmentInventoryRowEntity({ equipmentName: 'Rations', status })

    expect(entity.heading).toBe('Rations')
    expect(entity.description).toBeUndefined()
    expect(entity.status).toEqual(status)
    expect(entity.statusComposition).toBe('metadata')
  })

  it('omits the status lane when there is no status', () => {
    const entity = buildEquipmentInventoryRowEntity({ equipmentName: 'Rations', status: [] })

    expect(entity.status).toBeUndefined()
    expect(entity.statusComposition).toBeUndefined()
  })

  it('marks staged removal in the heading', () => {
    const entity = buildEquipmentInventoryRowEntity({
      equipmentName: 'Rations',
      stagedRemoval: true,
    })

    expect(entity.heading).toBeTruthy()
    expect(entity.heading).not.toBe('Rations')
    expect(entity.status).toBeUndefined()
  })
})

describe('resolveInventoryRowTrailingMeta', () => {
  it('uses the price line for trailing meta', () => {
    expect(resolveInventoryRowTrailingMeta({ kind: 'single', row: rationsRow })).toBe(
      '5 SP each · 1 GP total',
    )
  })

  it('prefers an explicit override', () => {
    expect(
      resolveInventoryRowTrailingMeta({ kind: 'single', row: rationsRow }, '1 Common choice'),
    ).toBe('1 Common choice')
  })
})
