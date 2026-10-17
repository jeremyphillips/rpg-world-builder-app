import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import { describe, expect, it } from 'vitest'

import { pickEquipment } from '@/test/fixtures/pick'
import { resolveEquipmentInstanceSummary } from '@rpg/contracts'

import { EQUIPMENT_CATALOG_REFERENCE_UNAVAILABLE_MESSAGE } from './equipment-catalog-reference-status.lib'

import { resolveCreatureEquipmentInventoryRowStatus } from './resolve-creature-equipment-inventory-row-status.lib'

describe('resolveCreatureEquipmentInventoryRowStatus', () => {
  it('prepends Not proficient before Magical when equipped badge is omitted', () => {
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
    const { status } = resolveCreatureEquipmentInventoryRowStatus({
      summary,
      catalogItem: greataxe,
      catalogMissing: false,
      isProficient: false,
      equippedStatusPresentation: 'omit',
    })
    const labels = status.map((row) => ('label' in row ? row.label : row.kind))
    expect(labels[0]).toBe('Not proficient')
    expect(labels).toContain('Magical')
    expect(labels.indexOf('Not proficient')).toBeLessThan(labels.indexOf('Magical'))
    expect(labels).not.toContain('+1 adjustment')
  })

  it('appends calculated adjustment facts after Magical and drops the raw adjustment blob', () => {
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
    const { status } = resolveCreatureEquipmentInventoryRowStatus({
      summary,
      catalogItem: greataxe,
      catalogMissing: false,
      isProficient: false,
      adjustmentSegments: ['+1 attack adjustment'],
      equippedStatusPresentation: 'omit',
    })
    const labels = status.map((row) => ('label' in row ? row.label : row.kind))
    expect(labels).toEqual(['Not proficient', 'Magical', '+1 attack adjustment'])
  })

  it('skips compatibility when the catalog row is missing', () => {
    const greataxe = pickEquipment('greataxe')
    const provider = createMagicPropertyDefinitionProvider('srd-cc-5.2.1')
    const entry = { entryId: 'g1', equipmentId: greataxe.id, quantity: 1 }
    const summary = resolveEquipmentInstanceSummary(entry, undefined, provider)
    const { status } = resolveCreatureEquipmentInventoryRowStatus({
      summary,
      catalogItem: undefined,
      catalogMissing: true,
      isProficient: false,
      equippedStatusPresentation: 'omit',
    })
    expect(status.some((row) => 'label' in row && row.label === 'Not proficient')).toBe(false)
    expect(
      status.some(
        (row) => 'label' in row && row.label === EQUIPMENT_CATALOG_REFERENCE_UNAVAILABLE_MESSAGE,
      ),
    ).toBe(true)
  })
})
