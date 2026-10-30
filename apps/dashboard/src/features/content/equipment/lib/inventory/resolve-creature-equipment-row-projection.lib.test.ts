import { systemDefaultArmorClassRules } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'
import { buildEquipmentCompactSummary } from '@rpg/contracts'

import { pickEquipment } from '@/test/fixtures/pick'

import {
  buildCreatureEquipmentRowSupportingMetadata,
  EQUIPMENT_ROW_UNMODIFIED_SUPPORTING_SEGMENT,
  resolveCreatureEquipmentRowProjection,
} from './resolve-creature-equipment-row-projection.lib'

describe('buildCreatureEquipmentRowSupportingMetadata', () => {
  it('prepends leading segments before calculated weapon metadata', () => {
    const greataxe = pickEquipment('greataxe')
    if (greataxe.kind !== 'weapon') throw new Error('expected weapon')

    const rowSummary = resolveCreatureEquipmentRowProjection({
      entry: { entryId: 'e1', equipmentId: greataxe.id, quantity: 1 },
      item: greataxe,
      abilityScores: { str: 16 },
      proficiencyBonus: 2,
      weaponProficiencies: { categories: ['martial'], items: [] },
      omitSharedEnhancement: false,
      provider: () => undefined,
    })

    expect(
      buildCreatureEquipmentRowSupportingMetadata({
        rowSummary,
        leadingSegments: [EQUIPMENT_ROW_UNMODIFIED_SUPPORTING_SEGMENT],
      }),
    ).toEqual([EQUIPMENT_ROW_UNMODIFIED_SUPPORTING_SEGMENT, '1d12+3 slashing', '+5 to hit'])
  })

  it('returns calculated segments when no leading segments are provided', () => {
    const greataxe = pickEquipment('greataxe')
    if (greataxe.kind !== 'weapon') throw new Error('expected weapon')

    const rowSummary = resolveCreatureEquipmentRowProjection({
      entry: { entryId: 'e1', equipmentId: greataxe.id, quantity: 1 },
      item: greataxe,
      abilityScores: { str: 10 },
      proficiencyBonus: 2,
      weaponProficiencies: { categories: ['martial'], items: [] },
      omitSharedEnhancement: false,
      provider: () => undefined,
    })

    expect(buildCreatureEquipmentRowSupportingMetadata({ rowSummary })).toEqual(
      rowSummary?.supportingMetadata,
    )
    expect(
      buildCreatureEquipmentRowSupportingMetadata({ rowSummary, catalogItem: greataxe }),
    ).toEqual(rowSummary?.supportingMetadata)
  })

  it('uses the compact armor summary for body armor and shields', () => {
    const plate = pickEquipment('plate-armor')
    const shield = pickEquipment('shield')

    const rules = systemDefaultArmorClassRules()
    expect(
      buildCreatureEquipmentRowSupportingMetadata({ catalogItem: plate, armorClassRules: rules }),
    ).toEqual([
      ...buildEquipmentCompactSummary(plate, { armorClassRules: systemDefaultArmorClassRules() })
        .comparisonGroups,
    ])
    expect(
      buildCreatureEquipmentRowSupportingMetadata({ catalogItem: shield, armorClassRules: rules }),
    ).toEqual([
      ...buildEquipmentCompactSummary(shield, { armorClassRules: systemDefaultArmorClassRules() })
        .comparisonGroups,
    ])
    expect(
      buildCreatureEquipmentRowSupportingMetadata({
        catalogItem: plate,
        armorClassRules: rules,
        leadingSegments: [EQUIPMENT_ROW_UNMODIFIED_SUPPORTING_SEGMENT],
      })[0],
    ).toBe(EQUIPMENT_ROW_UNMODIFIED_SUPPORTING_SEGMENT)
  })
})
