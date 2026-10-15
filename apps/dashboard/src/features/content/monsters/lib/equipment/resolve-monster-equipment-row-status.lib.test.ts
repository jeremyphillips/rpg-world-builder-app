import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'
import { resolveEquipmentInstanceSummary } from '@rpg/contracts'

import { EQUIPMENT_CATALOG_REFERENCE_UNAVAILABLE_MESSAGE } from '../../../equipment/lib/inventory/equipment-catalog-reference-status.lib'

import { resolveMonsterEquipmentRowStatus } from './resolve-monster-equipment-row-status.lib'

describe('resolveMonsterEquipmentRowStatus', () => {
  it('prepends Not proficient before Equipped and Magical', () => {
    const greataxe = pickEquipment('greataxe')
    const provider = createMagicPropertyDefinitionProvider('srd-cc-5.2.1')
    const entry = {
      entryId: 'g1',
      equipmentId: greataxe.id,
      quantity: 1,
      equipped: true,
      magical: true,
      adjustments: [{ effectId: 'enhancement', target: 'attack_roll' as const, bonus: 1 }],
    }
    const summary = resolveEquipmentInstanceSummary(entry, greataxe, provider)
    const { status } = resolveMonsterEquipmentRowStatus({
      summary,
      catalogItem: greataxe,
      catalogMissing: false,
      isProficient: false,
    })
    const labels = status.map((row) => ('label' in row ? row.label : row.kind))
    expect(labels[0]).toBe('Not proficient')
    expect(labels).toContain('Equipped')
    expect(labels).toContain('Magical')
    expect(labels.indexOf('Not proficient')).toBeLessThan(labels.indexOf('Equipped'))
  })

  it('skips compatibility when the catalog row is missing', () => {
    const greataxe = pickEquipment('greataxe')
    const provider = createMagicPropertyDefinitionProvider('srd-cc-5.2.1')
    const entry = { entryId: 'g1', equipmentId: greataxe.id, quantity: 1 }
    const summary = resolveEquipmentInstanceSummary(entry, undefined, provider)
    const { status } = resolveMonsterEquipmentRowStatus({
      summary,
      catalogItem: undefined,
      catalogMissing: true,
      isProficient: false,
    })
    expect(status.some((row) => 'label' in row && row.label === 'Not proficient')).toBe(false)
    expect(
      status.some(
        (row) => 'label' in row && row.label === EQUIPMENT_CATALOG_REFERENCE_UNAVAILABLE_MESSAGE,
      ),
    ).toBe(true)
  })
})
