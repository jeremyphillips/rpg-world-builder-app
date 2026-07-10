import { describe, expect, it } from 'vitest'

import { formatMoney, getEquipmentKindLabel } from '@rpg/contracts'

import { pickEquipment } from '../../lib/fixtures/pick'
import { getEquipmentKindStatRows } from './shared/equipment-detail-stat-rows'
import {
  buildEquipmentDetailViewModel,
  buildEquipmentPickerHeaderViewModel,
  EQUIPMENT_DETAILS_SECTION_TITLES,
  EQUIPMENT_STAT_LABELS,
} from './equipment-display'

const KIND_FIXTURES = [
  { slug: 'longsword', kind: 'weapon' as const },
  { slug: 'leather-armor', kind: 'armor' as const },
  { slug: 'torch', kind: 'adventuring_gear' as const },
  { slug: 'thieves-tools', kind: 'tool' as const },
  { slug: 'riding-horse', kind: 'mount' as const },
  { slug: 'rowboat', kind: 'vehicle' as const },
  { slug: 'skilled-hireling', kind: 'service' as const },
  { slug: 'bracers-of-defense', kind: 'magic_item' as const },
] as const

function expectedDetailStatRows(slug: string) {
  const equipment = pickEquipment(slug)
  return [
    { label: EQUIPMENT_STAT_LABELS.kind, value: getEquipmentKindLabel(equipment.kind) },
    { label: EQUIPMENT_STAT_LABELS.cost, value: formatMoney(equipment.cost) },
    ...getEquipmentKindStatRows(equipment),
  ].filter((row) => row.label !== EQUIPMENT_STAT_LABELS.gearKind)
}

describe('equipment-display', () => {
  describe('buildEquipmentPickerHeaderViewModel', () => {
    it.each(KIND_FIXTURES)('builds picker header for $kind', ({ slug, kind }) => {
      const equipment = pickEquipment(slug)
      expect(equipment.kind).toBe(kind)

      expect(buildEquipmentPickerHeaderViewModel(equipment)).toEqual({
        name: equipment.name,
        kindLabel: getEquipmentKindLabel(kind),
        priceLabel: formatMoney(equipment.cost),
      })
    })
  })

  describe('buildEquipmentDetailViewModel', () => {
    it.each(KIND_FIXTURES)('builds detail stat rows for $kind', ({ slug, kind }) => {
      const equipment = pickEquipment(slug)
      const viewModel = buildEquipmentDetailViewModel(equipment)

      expect(viewModel.detailsSectionTitle).toBe(EQUIPMENT_DETAILS_SECTION_TITLES[kind])
      expect(viewModel.statRows).toEqual(expectedDetailStatRows(slug))
    })

    it('includes description when present', () => {
      const equipment = {
        ...pickEquipment('longsword'),
        description: 'A versatile martial weapon.',
      }

      expect(buildEquipmentDetailViewModel(equipment).description).toBe(
        'A versatile martial weapon.',
      )
    })

    it('omits description when absent', () => {
      const equipment = { ...pickEquipment('longsword'), description: undefined }

      expect(buildEquipmentDetailViewModel(equipment).description).toBeUndefined()
    })

    it('omits description when empty', () => {
      const equipment = { ...pickEquipment('longsword'), description: '' }

      expect(buildEquipmentDetailViewModel(equipment).description).toBeUndefined()
    })
  })
})
