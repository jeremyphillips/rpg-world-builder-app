import {
  characterWealthFromGrant,
  formatEquipmentInventoryPriceLine,
  formatEquipmentPurchaseTotalPriceLabel,
  formatWealth,
  isStartingGoldOption,
  readSelectedStartingEquipmentOptionId,
  resolveGoldStartingEquipmentAlternative,
  resolveMagicItemAcquisitionState,
  resolveStartingEquipmentResolution,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterEquipment,
  type CharacterWealthGrant,
  type ChoiceSet,
  type ClassOptionPolicy,
  type EquipmentBudgetSummary,
  type EquipmentSourceAllocation,
} from '@rpg/contracts'

import type { EntitySummaryStatusItem } from '@/features/content'
import { joinInlineMetadata } from '@rpg/contracts/primitives'
import { enrichEquipmentInventoryRows } from './equipment-inventory-row-advisories.lib'
import {
  EQUIPMENT_CLASS_OPTIONS_REPLACED_MESSAGE,
  EQUIPMENT_GOLD_OPTION_STARTING_MESSAGE,
  EQUIPMENT_PENDING_PURCHASE_SOURCE_LABEL,
  formatEquipmentGoldOptionStartingDescription,
  listEquipmentInventoryRowsFromDraft,
  shouldShowMagicItemGrants,
  type EquipmentInventoryRow,
  type PackageCustomizeAffordance,
  type StartingPackageCategoryGroup,
  type StartingPackageInventoryGroup,
} from './equipment-step.lib'

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

  return joinInlineMetadata(parts)
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
    return display.bundleLabel ? joinInlineMetadata([priceLine, display.bundleLabel]) : priceLine
  }

  if (display.bundleLabel) return joinInlineMetadata([display.breakdownLabel, display.bundleLabel])
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

export type AddedEquipmentEntryViewModel = {
  equipmentId: string
  equipmentName: string
  group: keyof CharacterEquipment
  groupLabel: string
  totalQuantity: number
  sources: EquipmentSourceAllocation[]
  provenanceLabel: string
  rows: EquipmentInventoryRow[]
  advisoryStatusItems: readonly EntitySummaryStatusItem[]
}

export type AddedEquipmentCategoryGroup = {
  group: keyof CharacterEquipment
  groupLabel: string
  entries: AddedEquipmentEntryViewModel[]
}

export type EquipmentInventoryStartingChannel =
  | { kind: 'package'; group: StartingPackageInventoryGroup }
  | { kind: 'gold_option'; message: string; description: string }

export type EquipmentInventoryViewModel =
  | {
      layout: 'split'
      startingEquipment: EquipmentInventoryStartingChannel
      addedEquipment: AddedEquipmentCategoryGroup[]
    }
  /** Retained purchases with no starting option selected: Added Equipment only. */
  | { layout: 'pending'; addedEquipment: AddedEquipmentCategoryGroup[] }

function magicItemGrantSourceAllocation(
  row: EquipmentInventoryRow,
  removeTarget: Extract<EquipmentInventoryRow['removeTarget'], { kind: 'magicItemGrant' }>,
): EquipmentSourceAllocation {
  const source = row.entry.sources?.[0]
  return {
    kind: 'startingWealthTier',
    sourceId: source?.sourceId,
    grantId: source?.grantId,
    allowanceId: removeTarget.allowanceId,
    quantity: row.entry.quantity,
  }
}

function rowToSourceAllocation(row: EquipmentInventoryRow): EquipmentSourceAllocation | undefined {
  if (row.removeTarget?.kind === 'magicItemGrant') {
    return magicItemGrantSourceAllocation(row, row.removeTarget)
  }

  if (row.removeTarget?.kind === 'purchase') {
    return { kind: 'startingGold', quantity: row.entry.quantity }
  }

  const source = row.entry.sources?.[0]
  if (source?.kind !== 'manual') return undefined

  return {
    kind: 'manual',
    sourceId: source.sourceId,
    grantId: source.grantId,
    quantity: row.entry.quantity,
  }
}

function formatGrantProvenancePart(label: string, quantity: number): string {
  const normalized = label.replace(/\s+choice$/i, '')
  return `${quantity} ${normalized} choice${quantity === 1 ? '' : 's'}`
}

function formatPurchaseProvenancePart(
  rows: readonly EquipmentInventoryRow[],
  quantity: number,
  pending: boolean,
): string {
  const equipment = rows.find((row) => row.equipment)?.equipment
  if (pending) {
    const totalLabel = equipment ? formatEquipmentPurchaseTotalPriceLabel(equipment, quantity) : ''
    return totalLabel
      ? joinInlineMetadata([EQUIPMENT_PENDING_PURCHASE_SOURCE_LABEL, totalLabel])
      : EQUIPMENT_PENDING_PURCHASE_SOURCE_LABEL
  }
  if (!equipment || quantity <= 0) {
    return quantity === 1 ? '1 purchased' : `${quantity} purchased`
  }

  const totalLabel = formatEquipmentPurchaseTotalPriceLabel(equipment, quantity)
  return quantity === 1
    ? joinInlineMetadata(['Purchased', totalLabel])
    : `${quantity} purchased for ${totalLabel}`
}

/** Formats aggregated added-equipment provenance for inventory subtitles. */
export function formatAddedEquipmentProvenanceLabel(
  rows: readonly EquipmentInventoryRow[],
  pending = false,
): string {
  const grantTotals = new Map<string, number>()
  const purchaseRows: EquipmentInventoryRow[] = []
  let purchaseQuantity = 0

  for (const row of rows) {
    if (row.removeTarget?.kind === 'magicItemGrant') {
      grantTotals.set(row.sourceLabel, (grantTotals.get(row.sourceLabel) ?? 0) + row.entry.quantity)
      continue
    }

    if (row.removeTarget?.kind === 'purchase') {
      purchaseRows.push(row)
      purchaseQuantity += row.entry.quantity
    }
  }

  const parts: string[] = []

  for (const [label, quantity] of grantTotals) {
    parts.push(formatGrantProvenancePart(label, quantity))
  }

  if (purchaseQuantity > 0) {
    parts.push(formatPurchaseProvenancePart(purchaseRows, purchaseQuantity, pending))
  }

  return joinInlineMetadata(parts)
}

function aggregateAddedEquipmentRows(
  rows: readonly EquipmentInventoryRow[],
  pending = false,
): AddedEquipmentEntryViewModel[] {
  const byEquipmentId = new Map<string, EquipmentInventoryRow[]>()
  const order: string[] = []

  for (const row of rows) {
    const key = row.entry.equipmentId
    if (!byEquipmentId.has(key)) {
      byEquipmentId.set(key, [])
      order.push(key)
    }
    byEquipmentId.get(key)!.push(row)
  }

  return order.flatMap((equipmentId) => {
    const entryRows = byEquipmentId.get(equipmentId)!
    const first = entryRows[0]
    if (!first) return []

    const totalQuantity = entryRows.reduce((sum, row) => sum + row.entry.quantity, 0)
    const sources = entryRows.flatMap((row) => {
      const allocation = rowToSourceAllocation(row)
      return allocation ? [allocation] : []
    })

    return [
      {
        equipmentId,
        equipmentName: first.equipmentName,
        group: first.group,
        groupLabel: first.groupLabel,
        totalQuantity,
        sources,
        provenanceLabel: formatAddedEquipmentProvenanceLabel(entryRows, pending),
        rows: entryRows,
        advisoryStatusItems: first.advisoryStatusItems ?? [],
      },
    ]
  })
}

function groupAddedEquipmentByCategory(
  entries: readonly AddedEquipmentEntryViewModel[],
): AddedEquipmentCategoryGroup[] {
  const grouped = new Map<string, AddedEquipmentEntryViewModel[]>()
  const order: string[] = []

  for (const entry of entries) {
    if (!grouped.has(entry.groupLabel)) {
      grouped.set(entry.groupLabel, [])
      order.push(entry.groupLabel)
    }
    grouped.get(entry.groupLabel)!.push(entry)
  }

  return order.map((groupLabel) => {
    const categoryEntries = grouped.get(groupLabel)!
    return {
      group: categoryEntries[0]!.group,
      groupLabel,
      entries: categoryEntries,
    }
  })
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

function buildStartingPackageGroup(args: {
  selectedOptionId: string
  option: ClassStartingEquipmentOption
  packageRows: EquipmentInventoryRow[]
  classOptionPolicy: ClassOptionPolicy
  startingEquipment: ClassStartingEquipment
}): StartingPackageInventoryGroup {
  return {
    optionId: args.selectedOptionId,
    optionLabel: args.option.label,
    categoryGroups: groupRowsByCategory(args.packageRows),
    includedWealthLabel: formatStartingEquipmentWealth(args.option.wealth),
    customize: buildPackageCustomizeAffordance(args.classOptionPolicy, args.startingEquipment),
  }
}

function buildGoldOptionChannel(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  context?: CharacterBuildContext
}): EquipmentInventoryStartingChannel {
  const { draft, catalogIndex, context } = args
  const showMagicItemGrants = context
    ? shouldShowMagicItemGrants(resolveMagicItemAcquisitionState({ draft, context, catalogIndex }))
    : false
  return {
    kind: 'gold_option',
    message: EQUIPMENT_GOLD_OPTION_STARTING_MESSAGE,
    description: formatEquipmentGoldOptionStartingDescription(showMagicItemGrants),
  }
}

function resolveSelectedStartingOption(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
):
  | {
      selectedOptionId: string
      option: ClassStartingEquipmentOption
      startingEquipment: ClassStartingEquipment
    }
  | undefined {
  const classId = draft.class.classId
  if (!classId) return undefined
  const startingEquipment = catalogIndex.classes.get(classId)?.characterCreation?.startingEquipment
  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  const option = startingEquipment?.options.find((entry) => entry.id === selectedOptionId)
  if (!startingEquipment || !selectedOptionId || !option) return undefined
  return { selectedOptionId, option, startingEquipment }
}

function listBuilderInventoryRows(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  context?: CharacterBuildContext
  choiceSets: readonly ChoiceSet[]
}): EquipmentInventoryRow[] {
  const rows = listEquipmentInventoryRowsFromDraft(
    args.draft,
    args.catalogIndex,
    args.budget,
    args.context,
  )
  if (!args.context) return rows
  return enrichEquipmentInventoryRows({
    rows,
    draft: args.draft,
    context: args.context,
    choiceSets: args.choiceSets,
  })
}

function buildSplitInventoryViewModel(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  classOptionPolicy: ClassOptionPolicy
  context?: CharacterBuildContext
  choiceSets: readonly ChoiceSet[]
}): EquipmentInventoryViewModel | undefined {
  const { draft, catalogIndex, budget, classOptionPolicy, context, choiceSets } = args
  const selected = resolveSelectedStartingOption(draft, catalogIndex)
  if (!selected) return undefined

  const allRows = listBuilderInventoryRows({ draft, catalogIndex, budget, context, choiceSets })
  const packageRows = allRows.filter((row) => row.removeTarget?.kind === 'package')
  const addedRows = allRows.filter((row) => row.removeTarget?.kind !== 'package')

  const startingEquipment: EquipmentInventoryStartingChannel = isStartingGoldOption(selected.option)
    ? buildGoldOptionChannel({ draft, catalogIndex, context })
    : {
        kind: 'package',
        group: buildStartingPackageGroup({ ...selected, packageRows, classOptionPolicy }),
      }

  return {
    layout: 'split',
    startingEquipment,
    addedEquipment: groupAddedEquipmentByCategory(aggregateAddedEquipmentRows(addedRows)),
  }
}

/** Builds stable two-channel inventory view model for the equipment step. */
export function buildEquipmentInventoryViewModel(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  budget?: EquipmentBudgetSummary,
  classOptionPolicy: ClassOptionPolicy = 'included',
  context?: CharacterBuildContext,
  choiceSets: readonly ChoiceSet[] = [],
): EquipmentInventoryViewModel | undefined {
  switch (resolveStartingEquipmentResolution(draft, catalogIndex)) {
    case 'notApplicable':
    case 'unresolvedEmpty':
      return undefined
    case 'unresolvedWithPurchases': {
      const rows = listBuilderInventoryRows({ draft, catalogIndex, budget, context, choiceSets })
      return {
        layout: 'pending',
        addedEquipment: groupAddedEquipmentByCategory(aggregateAddedEquipmentRows(rows, true)),
      }
    }
    case 'selected':
      return buildSplitInventoryViewModel({
        draft,
        catalogIndex,
        budget,
        classOptionPolicy,
        context,
        choiceSets,
      })
  }
}
