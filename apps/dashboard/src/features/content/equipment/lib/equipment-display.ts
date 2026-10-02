import {
  buildEquipmentCompactSummary,
  formatEquipmentCostLabel,
  getEquipmentKindLabel,
  type Equipment,
  type EquipmentCompactSummaryProfile,
  type EquipmentKind,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/detail/metadata/content-stat-rows'
import { getEquipmentKindStatRows } from './shared/equipment-detail-stat-rows'

export const EQUIPMENT_STAT_LABELS = {
  kind: 'Kind',
  cost: 'Cost',
  gearKind: 'Gear kind',
} as const

export const EQUIPMENT_STAT_ROW_IDS = {
  kind: 'equipment-stat-kind',
  cost: 'equipment-stat-cost',
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

export type EquipmentStatRowSurface = 'metadata' | 'content-detail-hero'

export type EquipmentPickerRowViewModel = {
  name: string
  priceLabel: string
  kindLabel: string
  comparisonGroups: readonly string[]
}

export type EquipmentDetailViewModel = {
  /** Hero / layout classification (e.g. Weapon, Armor) — not tied to eyebrow placement. */
  classificationLabel: string
  /** Section heading in collapsible body, e.g. "Weapon details" */
  detailsSectionTitle: string
  /** Full metadata rows including Kind — picker, character tab, EquipmentDetailMetadata. */
  statRows: ContentStatRowData[]
  /** Catalog detail hero rows — Kind omitted at build time. */
  heroStatRows: ContentStatRowData[]
  description?: string
}

const NO_MARKET_PRICE_LABEL = 'No market price'

function formatEquipmentCostDisplay(cost: Equipment['cost']): string {
  return formatEquipmentCostLabel(cost) ?? NO_MARKET_PRICE_LABEL
}

function buildEquipmentStatRows(
  equipment: Equipment,
  surface: EquipmentStatRowSurface,
): ContentStatRowData[] {
  const rows: ContentStatRowData[] = []

  if (surface === 'metadata') {
    rows.push({
      id: EQUIPMENT_STAT_ROW_IDS.kind,
      label: EQUIPMENT_STAT_LABELS.kind,
      value: getEquipmentKindLabel(equipment.kind),
    })
  }

  rows.push({
    id: EQUIPMENT_STAT_ROW_IDS.cost,
    label: EQUIPMENT_STAT_LABELS.cost,
    value: formatEquipmentCostDisplay(equipment.cost),
  })

  rows.push(...getEquipmentKindStatRows(equipment))

  return rows.filter((row) => !OMITTED_EQUIPMENT_DETAIL_STAT_ROW_LABELS.has(row.label))
}

export function buildEquipmentPickerRowViewModel(
  equipment: Equipment,
  profile: EquipmentCompactSummaryProfile = 'standard',
): EquipmentPickerRowViewModel {
  const { kindLabel, comparisonGroups } = buildEquipmentCompactSummary(equipment, profile)

  return {
    name: equipment.name,
    priceLabel: formatEquipmentCostLabel(equipment.cost) ?? '',
    kindLabel,
    comparisonGroups,
  }
}

export function buildEquipmentDetailViewModel(equipment: Equipment): EquipmentDetailViewModel {
  return {
    classificationLabel: getEquipmentKindLabel(equipment.kind),
    detailsSectionTitle: EQUIPMENT_DETAILS_SECTION_TITLES[equipment.kind],
    statRows: buildEquipmentStatRows(equipment, 'metadata'),
    heroStatRows: buildEquipmentStatRows(equipment, 'content-detail-hero'),
    description: equipment.description || undefined,
  }
}
