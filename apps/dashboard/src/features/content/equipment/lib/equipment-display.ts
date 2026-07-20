import {
  buildEquipmentCompactSummary,
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
  gearKind: 'Gear kind',
} as const

const OMITTED_EQUIPMENT_DETAIL_STAT_ROW_LABELS = new Set<string>([EQUIPMENT_STAT_LABELS.gearKind])

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

export type EquipmentPickerRowViewModel = {
  name: string
  priceLabel: string
  kindLabel: string
  comparisonGroups: readonly string[]
}

export type EquipmentDetailViewModel = {
  /** Section heading in collapsible body, e.g. "Weapon details" */
  detailsSectionTitle: string
  statRows: ContentStatRowData[]
  description?: string
}

const NO_MARKET_PRICE_LABEL = 'No market price'

function formatEquipmentCostDisplay(cost: Equipment['cost']): string {
  return cost ? formatMoney(cost) : NO_MARKET_PRICE_LABEL
}

function buildEquipmentStatRows(equipment: Equipment): ContentStatRowData[] {
  return [
    { label: EQUIPMENT_STAT_LABELS.kind, value: getEquipmentKindLabel(equipment.kind) },
    { label: EQUIPMENT_STAT_LABELS.cost, value: formatEquipmentCostDisplay(equipment.cost) },
    ...getEquipmentKindStatRows(equipment),
  ].filter((row) => !OMITTED_EQUIPMENT_DETAIL_STAT_ROW_LABELS.has(row.label))
}

export function buildEquipmentPickerRowViewModel(
  equipment: Equipment,
): EquipmentPickerRowViewModel {
  const { kindLabel, comparisonGroups } = buildEquipmentCompactSummary(equipment)

  return {
    name: equipment.name,
    priceLabel: equipment.cost ? formatMoney(equipment.cost) : '',
    kindLabel,
    comparisonGroups,
  }
}

export function buildEquipmentDetailViewModel(equipment: Equipment): EquipmentDetailViewModel {
  return {
    detailsSectionTitle: EQUIPMENT_DETAILS_SECTION_TITLES[equipment.kind],
    statRows: buildEquipmentStatRows(equipment),
    description: equipment.description || undefined,
  }
}
