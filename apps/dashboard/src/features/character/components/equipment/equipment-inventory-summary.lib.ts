import {
  characterWealthFromGrant,
  formatEquipmentInventoryPriceLine,
  formatWealth,
  isStartingGoldOption,
  readSelectedStartingEquipmentOptionId,
  resolveGoldStartingEquipmentAlternative,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterEquipment,
  type CharacterWealthGrant,
  type ClassOptionPolicy,
  type EquipmentBudgetSummary,
} from '@rpg/contracts'

import {
  EQUIPMENT_CLASS_OPTIONS_REPLACED_MESSAGE,
  listEquipmentInventoryRowsFromDraft,
  type EquipmentInventoryRow,
  type PackageCustomizeAffordance,
  type StartingPackageCategoryGroup,
  type StartingPackageInventoryGroup,
} from '../../lib/equipment-step.lib'

type CatalogClass = NonNullable<ReturnType<CharacterBuildCatalogIndex['classes']['get']>>
type ClassStartingEquipment = NonNullable<
  NonNullable<CatalogClass['characterCreation']>['startingEquipment']
>
type ClassStartingEquipmentOption = ClassStartingEquipment['options'][number]

function formatStartingEquipmentWealth(
  wealth: CharacterWealthGrant | undefined,
): string | undefined {
  if (!wealth) return undefined
  return formatWealth(characterWealthFromGrant(wealth))
}

export type EquipmentInventorySourceBreakdown = {
  included: number
  purchased: number
  manual: number
  grant: number
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
  if (row.removeTarget?.kind === 'magicItemGrant') return 'grant'

  const sourceKind = row.entry.sources?.[0]?.kind
  if (sourceKind === 'manual') return 'manual'
  if (sourceKind === 'startingGold') return 'purchased'
  if (sourceKind === 'startingWealthTier') return 'grant'
  return 'included'
}

export function formatEquipmentInventorySourceBreakdownLabel(
  breakdown: EquipmentInventorySourceBreakdown,
): string {
  const total = breakdown.included + breakdown.purchased + breakdown.manual + breakdown.grant
  const parts = [`${total} total`]

  if (breakdown.included > 0) parts.push(`${breakdown.included} included`)
  if (breakdown.grant > 0) parts.push(`${breakdown.grant} grant choice`)
  if (breakdown.purchased > 0) parts.push(`${breakdown.purchased} purchased`)
  if (breakdown.manual > 0) parts.push(`${breakdown.manual} manual`)

  return parts.join(' · ')
}

export function resolveCombinedInventoryDetailLineLabel(
  display: Extract<EquipmentInventoryDisplayItem, { kind: 'combined' }>,
): string {
  const hasIncluded = display.rows.some((row) => row.removeTarget?.kind === 'package')
  const hasManual = display.rows.some((row) =>
    row.entry.sources?.some((source) => source.kind === 'manual'),
  )

  if (!hasIncluded && !hasManual && display.equipment) {
    const priceLine = formatEquipmentInventoryPriceLine({
      equipment: display.equipment,
      quantity: display.totalQuantity,
      priceContext: 'startingGold',
    })
    return display.bundleLabel ? `${priceLine} · ${display.bundleLabel}` : priceLine
  }

  if (display.bundleLabel) return `${display.breakdownLabel} · ${display.bundleLabel}`
  return display.breakdownLabel
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
      { included: 0, purchased: 0, manual: 0, grant: 0 },
    )

    items.push({
      kind: 'combined',
      group: first.group,
      equipmentId: first.entry.equipmentId,
      equipmentName: first.equipmentName,
      equipment: first.equipment,
      totalQuantity: breakdown.included + breakdown.purchased + breakdown.manual + breakdown.grant,
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
        : row.removeTarget?.kind === 'magicItemGrant'
          ? `${row.removeTarget.allowanceId}:${row.removeTarget.equipmentId}`
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
      magicItems: PurchasedCategoryGroup[]
      purchased: PurchasedCategoryGroup[]
    }
  | { mode: 'gold'; magicItems: PurchasedCategoryGroup[]; purchased: PurchasedCategoryGroup[] }

export function hasEquipmentInventoryContent(layout: EquipmentInventoryLayout): boolean {
  const hasMagicItems = layout.magicItems.some((group) => group.displays.length > 0)

  if (layout.mode === 'gold') {
    return hasMagicItems || layout.purchased.some((group) => group.displays.length > 0)
  }

  return (
    layout.startingPackage.categoryGroups.some((group) => group.rows.length > 0) ||
    hasMagicItems ||
    layout.purchased.some((group) => group.displays.length > 0)
  )
}

export function shouldRenderEquipmentInventorySummary(
  layout: EquipmentInventoryLayout | undefined,
  showBrowseEquipment: boolean,
): layout is EquipmentInventoryLayout {
  if (!layout) return false
  return showBrowseEquipment || hasEquipmentInventoryContent(layout)
}

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
      displays: groupEquipmentInventoryRowsForDisplay(groupRows, { allowCombinedRows: true }),
    }
  })
}

function partitionInventoryRowsBySource(rows: readonly EquipmentInventoryRow[]) {
  return {
    packageRows: rows.filter((row) => row.removeTarget?.kind === 'package'),
    magicItemRows: rows.filter((row) => row.removeTarget?.kind === 'magicItemGrant'),
    purchasedRows: rows.filter((row) => row.removeTarget?.kind === 'purchase'),
  }
}

function buildPackageCustomizeAffordance(
  classOptionPolicy: ClassOptionPolicy,
  startingEquipment: ClassStartingEquipment,
): PackageCustomizeAffordance {
  if (classOptionPolicy === 'replaced') {
    return {
      status: 'disabled',
      reason: EQUIPMENT_CLASS_OPTIONS_REPLACED_MESSAGE,
    }
  }

  const goldAlternative = resolveGoldStartingEquipmentAlternative(startingEquipment.options)
  return goldAlternative.status === 'available'
    ? { status: 'available' }
    : { status: 'disabled', reason: goldAlternative.reason }
}

function buildPackageModeLayout(args: {
  selectedOptionId: string
  option: ClassStartingEquipmentOption
  packageRows: EquipmentInventoryRow[]
  magicItems: PurchasedCategoryGroup[]
  purchased: PurchasedCategoryGroup[]
  classOptionPolicy: ClassOptionPolicy
  startingEquipment: ClassStartingEquipment
}): EquipmentInventoryLayout {
  return {
    mode: 'package',
    startingPackage: {
      optionId: args.selectedOptionId,
      optionLabel: args.option.label,
      categoryGroups: groupRowsByCategory(args.packageRows),
      includedWealthLabel: formatStartingEquipmentWealth(args.option.wealth),
      customize: buildPackageCustomizeAffordance(args.classOptionPolicy, args.startingEquipment),
    },
    magicItems: args.magicItems,
    purchased: args.purchased,
  }
}

/** Builds source-grouped inventory layout for package vs purchased sections. */
export function buildEquipmentInventoryLayout(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  budget?: EquipmentBudgetSummary,
  classOptionPolicy: ClassOptionPolicy = 'included',
  context?: CharacterBuildContext,
): EquipmentInventoryLayout | undefined {
  const classId = draft.class.classId
  if (!classId) return undefined

  const characterClass = catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!characterClass || !startingEquipment || !selectedOptionId) return undefined

  const option = startingEquipment.options.find((entry) => entry.id === selectedOptionId)
  if (!option) return undefined

  const isGoldPath = draft.equipment?.mode === 'gold' || isStartingGoldOption(option)
  const allRows = listEquipmentInventoryRowsFromDraft(draft, catalogIndex, budget, context)
  const { packageRows, magicItemRows, purchasedRows } = partitionInventoryRowsBySource(allRows)

  const magicItems = buildPurchasedCategoryGroups(magicItemRows)
  const purchased = buildPurchasedCategoryGroups(purchasedRows)

  if (isGoldPath) {
    return { mode: 'gold', magicItems, purchased }
  }

  return buildPackageModeLayout({
    selectedOptionId,
    option,
    packageRows,
    magicItems,
    purchased,
    classOptionPolicy,
    startingEquipment,
  })
}
