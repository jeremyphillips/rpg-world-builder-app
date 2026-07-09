import {
  formatMoney,
  getEquipmentKindLabel,
  type Equipment,
  type EquipmentKind,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/detail/content-stat-rows'
import { getEquipmentKindStatRows } from './shared/equipment-detail-stat-rows'

export const EQUIPMENT_STAT_LABELS = {
  kind: 'Kind',
  cost: 'Cost',
} as const

export const EQUIPMENT_DETAILS_SECTION_TITLES = {
  weapon: 'Weapon details',
  armor: 'Armor details',
  adventuring_gear: 'Adventuring gear details',
  tool: 'Tool details',
  mount: 'Mount details',
  vehicle: 'Vehicle details',
  service: 'Service details',
  magic_item: 'Magic item details',
} as const satisfies Record<EquipmentKind, string>

export type EquipmentCardViewModel = {
  /** Picker header: "{name} · {kind label}" */
  title: string
  /** Picker header rail: unit price */
  priceLabel: string
}

export type EquipmentDetailViewModel = {
  /** Section heading in collapsible body, e.g. "Weapon details" */
  detailsSectionTitle: string
  statRows: ContentStatRowData[]
  description?: string
}

function buildEquipmentStatRows(equipment: Equipment): ContentStatRowData[] {
  return [
    { label: EQUIPMENT_STAT_LABELS.kind, value: getEquipmentKindLabel(equipment.kind) },
    { label: EQUIPMENT_STAT_LABELS.cost, value: formatMoney(equipment.cost) },
    ...getEquipmentKindStatRows(equipment),
  ]
}

export function buildEquipmentPickerHeaderViewModel(equipment: Equipment): EquipmentCardViewModel {
  return {
    title: `${equipment.name} · ${getEquipmentKindLabel(equipment.kind)}`,
    priceLabel: formatMoney(equipment.cost),
  }
}

export function buildEquipmentDetailViewModel(equipment: Equipment): EquipmentDetailViewModel {
  return {
    detailsSectionTitle: EQUIPMENT_DETAILS_SECTION_TITLES[equipment.kind],
    statRows: buildEquipmentStatRows(equipment),
    description: equipment.description || undefined,
  }
}
