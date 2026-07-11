import type {
  CharacterBuildCatalogIndex,
  CharacterBuilderDraft,
  CharacterEquipment,
} from '@rpg/contracts'
import {
  readSelectedStartingEquipmentOptionId,
  resolveGoldStartingEquipmentAlternative,
} from '@rpg/contracts'

import {
  formatStartingEquipmentWealth,
  isStartingGoldOptionId,
  listEquipmentInventoryRowsFromDraft,
  type EquipmentInventoryRow,
  type PackageCustomizeAffordance,
  type StartingPackageCategoryGroup,
  type StartingPackageInventoryGroup,
} from '../../lib/equipment-step.lib'

export type EquipmentInventorySourceBreakdown = {
  included: number
  purchased: number
  manual: number
}

export type EquipmentInventoryDisplayItem =
  | { kind: 'single'; row: EquipmentInventoryRow }
  | {
      kind: 'combined'
      group: keyof CharacterEquipment
      equipmentId: string
      equipmentName: string
      equipment?: EquipmentInventoryRow['equipment']
      totalQuantity: number
      breakdownLabel: string
      bundleLabel?: string
      rows: EquipmentInventoryRow[]
    }

function breakdownBucket(row: EquipmentInventoryRow): keyof EquipmentInventorySourceBreakdown {
  if (row.removeTarget?.kind === 'package') return 'included'

  const sourceKind = row.entry.sources?.[0]?.kind
  if (sourceKind === 'manual') return 'manual'
  if (sourceKind === 'startingGold') return 'purchased'
  return 'included'
}

export function formatEquipmentInventorySourceBreakdownLabel(
  breakdown: EquipmentInventorySourceBreakdown,
): string {
  const total = breakdown.included + breakdown.purchased + breakdown.manual
  const parts = [`${total} total`]

  if (breakdown.included > 0) parts.push(`${breakdown.included} included`)
  if (breakdown.purchased > 0) parts.push(`${breakdown.purchased} purchased`)
  if (breakdown.manual > 0) parts.push(`${breakdown.manual} manual`)

  return parts.join(' · ')
}

export function groupEquipmentInventoryRowsForDisplay(
  rows: readonly EquipmentInventoryRow[],
  options?: { allowCombinedRows?: boolean },
): EquipmentInventoryDisplayItem[] {
  const allowCombinedRows = options?.allowCombinedRows ?? true
  const byEquipment = new Map<string, EquipmentInventoryRow[]>()
  const order: string[] = []

  for (const row of rows) {
    const key = `${row.group}:${row.entry.equipmentId}`
    if (!byEquipment.has(key)) {
      byEquipment.set(key, [])
      order.push(key)
    }
    byEquipment.get(key)!.push(row)
  }

  const items: EquipmentInventoryDisplayItem[] = []

  for (const key of order) {
    const groupRows = byEquipment.get(key)!
    if (!allowCombinedRows || groupRows.length === 1) {
      for (const row of groupRows) {
        items.push({ kind: 'single', row })
      }
      continue
    }

    const first = groupRows[0]!
    const breakdown = groupRows.reduce<EquipmentInventorySourceBreakdown>(
      (totals, row) => {
        totals[breakdownBucket(row)] += row.entry.quantity
        return totals
      },
      { included: 0, purchased: 0, manual: 0 },
    )

    items.push({
      kind: 'combined',
      group: first.group,
      equipmentId: first.entry.equipmentId,
      equipmentName: first.equipmentName,
      equipment: first.equipment,
      totalQuantity: breakdown.included + breakdown.purchased + breakdown.manual,
      breakdownLabel: formatEquipmentInventorySourceBreakdownLabel(breakdown),
      bundleLabel: first.bundleLabel,
      rows: groupRows,
    })
  }

  return items
}

export function equipmentInventoryRowKey(row: EquipmentInventoryRow): string {
  const removeKey =
    row.removeTarget?.kind === 'purchase'
      ? row.removeTarget.purchaseId
      : row.removeTarget?.kind === 'package'
        ? row.removeTarget.packageItemKey
        : 'static'

  return `${row.group}-${row.entry.equipmentId}-${row.sourceLabel}-${removeKey}`
}

export function equipmentInventoryDisplayItemKey(item: EquipmentInventoryDisplayItem): string {
  if (item.kind === 'single') return equipmentInventoryRowKey(item.row)

  return `${item.group}-${item.equipmentId}-combined-${item.rows.map((row) => equipmentInventoryRowKey(row)).join('|')}`
}

export type PurchasedCategoryGroup = {
  group: keyof CharacterEquipment
  groupLabel: string
  displays: EquipmentInventoryDisplayItem[]
}

export type EquipmentInventoryLayout =
  | {
      mode: 'package'
      startingPackage: StartingPackageInventoryGroup
      purchased: PurchasedCategoryGroup[]
    }
  | { mode: 'gold'; purchased: PurchasedCategoryGroup[] }

function groupRowsByCategory(
  rows: readonly EquipmentInventoryRow[],
): StartingPackageCategoryGroup[] {
  const grouped = new Map<string, EquipmentInventoryRow[]>()
  const order: string[] = []

  for (const row of rows) {
    if (!grouped.has(row.groupLabel)) {
      grouped.set(row.groupLabel, [])
      order.push(row.groupLabel)
    }
    grouped.get(row.groupLabel)!.push(row)
  }

  return order.map((groupLabel) => {
    const groupRows = grouped.get(groupLabel)!
    return {
      group: groupRows[0]!.group,
      groupLabel,
      rows: groupRows,
    }
  })
}

function buildPurchasedCategoryGroups(
  rows: readonly EquipmentInventoryRow[],
  allowCombinedRows: boolean,
): PurchasedCategoryGroup[] {
  const grouped = new Map<string, EquipmentInventoryRow[]>()
  const order: string[] = []

  for (const row of rows) {
    if (!grouped.has(row.groupLabel)) {
      grouped.set(row.groupLabel, [])
      order.push(row.groupLabel)
    }
    grouped.get(row.groupLabel)!.push(row)
  }

  return order.map((groupLabel) => {
    const groupRows = grouped.get(groupLabel)!
    return {
      group: groupRows[0]!.group,
      groupLabel,
      displays: groupEquipmentInventoryRowsForDisplay(groupRows, { allowCombinedRows }),
    }
  })
}

/** Builds source-grouped inventory layout for package vs purchased sections. */
export function buildEquipmentInventoryLayout(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): EquipmentInventoryLayout | undefined {
  const classId = draft.class.classId
  if (!classId) return undefined

  const characterClass = catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!characterClass || !startingEquipment || !selectedOptionId) return undefined

  const option = startingEquipment.options.find((entry) => entry.id === selectedOptionId)
  if (!option) return undefined

  const isGoldPath = draft.equipment?.mode === 'gold' || isStartingGoldOptionId(selectedOptionId)
  const allRows = listEquipmentInventoryRowsFromDraft(draft, catalogIndex)
  const packageRows = allRows.filter((row) => row.removeTarget?.kind === 'package')
  const purchasedRows = allRows.filter((row) => row.removeTarget?.kind === 'purchase')

  const purchased = buildPurchasedCategoryGroups(purchasedRows, isGoldPath)

  if (isGoldPath) {
    return { mode: 'gold', purchased }
  }

  const goldAlternative = resolveGoldStartingEquipmentAlternative(
    startingEquipment.options,
    selectedOptionId,
  )
  const customize: PackageCustomizeAffordance =
    goldAlternative.status === 'available'
      ? { status: 'available' }
      : { status: 'disabled', reason: goldAlternative.reason }

  return {
    mode: 'package',
    startingPackage: {
      optionId: selectedOptionId,
      optionLabel: option.label,
      categoryGroups: groupRowsByCategory(packageRows),
      includedWealthLabel: formatStartingEquipmentWealth(option.wealth),
      customize,
    },
    purchased,
  }
}
