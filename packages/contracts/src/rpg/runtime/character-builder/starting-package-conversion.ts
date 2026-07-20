import type { Equipment } from '../../content/equipment'
import { isEquipmentStackable } from '../../content/equipment/stackable'
import {
  isStartingGoldOption,
  type StartingEquipmentOption,
} from '../../content/starting-equipment'
import type { CharacterBuildCatalogIndex } from './context'
import type {
  CharacterBuilderDraft,
  CharacterBuilderDraftEquipmentPurchase,
  NormalizedCharacterBuilderDraftEquipmentPurchase,
} from './draft'
import {
  createEquipmentPurchaseId,
  mergeCompatiblePurchasedEntries,
  normalizeCharacterBuilderDraftPurchases,
} from './equipment-purchase'
import {
  resolveStartingEquipmentOption,
  type ResolvedStartingEquipmentItem,
} from './assembly/assemble-starting-equipment'
import {
  readSelectedStartingEquipmentOptionId,
  startingEquipmentChoiceSetId,
} from './resolvers/equipment/resolve-starting-equipment-choice-sets'
import { startingEquipmentPackageItemKey } from './resolvers/equipment/derive-equipment-draft-entries'
import { wealthToCopper } from './resolvers/equipment/equipment-budget'
import type { ResolvedStartingEquipmentFunding } from './resolvers/equipment/resolve-starting-equipment-funding'
import {
  resolveEquipmentPurchasePricing,
  type EquipmentPurchasePricing,
} from './resolvers/equipment/resolve-equipment-purchase-pricing'

export const STARTING_EQUIPMENT_GOLD_OPTION_ID = 'gold'

export type GoldStartingEquipmentAlternative =
  | { status: 'available'; option: StartingEquipmentOption }
  | { status: 'unavailable'; reason: string }

export type StartingPackageConversionItemStatus = 'selectable' | 'blocked'

export type StartingPackageConversionItem = {
  packageItemKey: string
  itemIndex: number
  equipmentId: string
  equipmentName: string
  grantQuantity: number
  purchaseQuantity: number
  equipped?: boolean
  modifiers?: CharacterBuilderDraftEquipmentPurchase['modifiers']
  pricing: EquipmentPurchasePricing
  status: StartingPackageConversionItemStatus
  blockingIssue?: string
}

export type StartingPackageConversionBudget = {
  startingCp: number
  existingPurchaseCostCp: number
  selectedConversionCostCp: number
  remainingCp: number
}

export type StartingPackageConversionPreview = {
  goldOptionId: string
  goldOptionLabel: string
  items: StartingPackageConversionItem[]
  budget: StartingPackageConversionBudget
}

type PackageConversionContext = {
  classId: string
  departingOption: StartingEquipmentOption
  goldAlternative: Extract<GoldStartingEquipmentAlternative, { status: 'available' }>
}

function sumPurchaseCostCp(
  purchases: readonly CharacterBuilderDraftEquipmentPurchase[],
  catalogIndex: CharacterBuildCatalogIndex,
): number {
  return purchases.reduce((total, purchase) => {
    const equipment = catalogIndex.equipment.get(purchase.equipmentId)
    if (!equipment) return total

    const pricing = resolveEquipmentPurchasePricing(equipment)
    if (pricing.status === 'unavailable') return total

    return total + pricing.unitCostCp * purchase.quantity
  }, 0)
}

function conversionItemCostCp(item: StartingPackageConversionItem): number {
  if (item.status === 'blocked') return 0
  if (item.pricing.status === 'unavailable') return 0
  return item.pricing.unitCostCp * item.purchaseQuantity
}

function grantQuantityFromResolvedItem(item: ResolvedStartingEquipmentItem): number | undefined {
  if (item.kind === 'grant') return item.grant.quantity ?? 1
  if (item.kind === 'proficiency_linked_grant') {
    if (item.status !== 'resolved') return undefined
    return item.grant.quantity ?? 1
  }
  if (item.kind === 'choice') {
    if (!item.selectedEquipmentId) return undefined
    return 1
  }
  return undefined
}

function equippedFromResolvedItem(item: ResolvedStartingEquipmentItem): boolean | undefined {
  if (item.kind === 'grant' || item.kind === 'proficiency_linked_grant') {
    return item.grant.equipped
  }
  return undefined
}

function modifiersFromResolvedItem(
  item: ResolvedStartingEquipmentItem,
): CharacterBuilderDraftEquipmentPurchase['modifiers'] | undefined {
  if (item.kind === 'grant' || item.kind === 'proficiency_linked_grant') {
    return item.grant.modifiers
  }
  return undefined
}

function equipmentFromResolvedItem(item: ResolvedStartingEquipmentItem): Equipment | undefined {
  if (item.kind === 'grant') return item.equipment
  if (item.kind === 'proficiency_linked_grant') return item.equipment
  if (item.kind === 'choice') return item.equipment
  return undefined
}

function equipmentIdFromResolvedItem(item: ResolvedStartingEquipmentItem): string | undefined {
  if (item.kind === 'grant') return item.equipmentId
  if (item.kind === 'proficiency_linked_grant') {
    return item.status === 'resolved' ? item.equipmentId : undefined
  }
  if (item.kind === 'choice') return item.selectedEquipmentId
  return undefined
}

function blockingIssueForResolvedItem(item: ResolvedStartingEquipmentItem): string | undefined {
  if (item.kind === 'proficiency_linked_grant') {
    if (item.status === 'pending') {
      return 'Resolve the linked proficiency choice before converting this package.'
    }
    if (item.status === 'invalid') {
      return item.issue ?? 'The linked proficiency choice is invalid.'
    }
  }

  if (item.kind === 'choice' && !item.selectedEquipmentId) {
    return 'Choose an option for this package slot before converting.'
  }

  const equipmentId = equipmentIdFromResolvedItem(item)
  if (!equipmentId) {
    return 'This package item could not be resolved.'
  }

  return undefined
}

/** Finds the wealth-only gold alternative paired with a departing package option. */
export function resolveGoldStartingEquipmentAlternative(
  options: readonly StartingEquipmentOption[],
): GoldStartingEquipmentAlternative {
  const option = options.find(isStartingGoldOption)
  if (!option) {
    return {
      status: 'unavailable',
      reason: 'No starting-gold alternative is configured for this package.',
    }
  }

  return { status: 'available', option }
}

/** Converts authored grant item units to purchase bundle units. */
export function purchaseUnitsForGrant(equipment: Equipment, grantQuantity: number): number {
  if (grantQuantity < 1) return 1

  if (
    isEquipmentStackable(equipment) &&
    equipment.kind === 'adventuring_gear' &&
    equipment.bundleSize !== undefined &&
    equipment.bundleSize > 0
  ) {
    return Math.max(1, Math.ceil(grantQuantity / equipment.bundleSize))
  }

  return grantQuantity
}

function conversionItemSharedFields(args: {
  classId: string
  departingOptionId: string
  item: ResolvedStartingEquipmentItem
  itemIndex: number
}): Pick<
  StartingPackageConversionItem,
  'packageItemKey' | 'itemIndex' | 'equipped' | 'modifiers' | 'grantQuantity'
> {
  const { classId, departingOptionId, item, itemIndex } = args

  return {
    packageItemKey: startingEquipmentPackageItemKey(classId, departingOptionId, itemIndex),
    itemIndex,
    grantQuantity: grantQuantityFromResolvedItem(item) ?? 1,
    equipped: equippedFromResolvedItem(item),
    modifiers: modifiersFromResolvedItem(item),
  }
}

function buildBlockedConversionItem(args: {
  shared: ReturnType<typeof conversionItemSharedFields>
  equipmentId: string
  equipmentName: string
  blockingIssue: string
}): StartingPackageConversionItem {
  return {
    ...args.shared,
    equipmentId: args.equipmentId,
    equipmentName: args.equipmentName,
    purchaseQuantity: 1,
    pricing: { status: 'unavailable' },
    status: 'blocked',
    blockingIssue: args.blockingIssue,
  }
}

function buildSelectableConversionItem(args: {
  shared: ReturnType<typeof conversionItemSharedFields>
  equipment: Equipment
  equipmentId: string
}): StartingPackageConversionItem {
  const purchaseQuantity = purchaseUnitsForGrant(args.equipment, args.shared.grantQuantity)
  const pricing = resolveEquipmentPurchasePricing(args.equipment)

  if (pricing.status === 'unavailable') {
    return buildBlockedConversionItem({
      shared: args.shared,
      equipmentId: args.equipmentId,
      equipmentName: args.equipment.name,
      blockingIssue: 'This item has no market price and cannot be purchased with starting gold.',
    })
  }

  return {
    ...args.shared,
    equipmentId: args.equipmentId,
    equipmentName: args.equipment.name,
    purchaseQuantity,
    pricing,
    status: 'selectable',
  }
}

function buildConversionItem(args: {
  classId: string
  departingOptionId: string
  item: ResolvedStartingEquipmentItem
  itemIndex: number
}): StartingPackageConversionItem | undefined {
  const shared = conversionItemSharedFields(args)
  const resolutionIssue = blockingIssueForResolvedItem(args.item)
  const equipmentId = equipmentIdFromResolvedItem(args.item)
  const equipment = equipmentFromResolvedItem(args.item)

  if (resolutionIssue || !equipmentId || !equipment) {
    return buildBlockedConversionItem({
      shared,
      equipmentId: equipmentId ?? 'unresolved',
      equipmentName: equipment?.name ?? equipmentId ?? 'Unresolved item',
      blockingIssue: resolutionIssue ?? 'This package item could not be resolved.',
    })
  }

  return buildSelectableConversionItem({ shared, equipment, equipmentId })
}

function resolvePackageConversionContext(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  departingOptionId: string
}): PackageConversionContext | undefined {
  const { draft, catalogIndex, departingOptionId } = args
  const classId = draft.class.classId
  if (!classId) return undefined

  const characterClass = catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  if (!characterClass || !startingEquipment) return undefined

  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!selectedOptionId || selectedOptionId !== departingOptionId) return undefined

  const departingOption = startingEquipment.options.find(
    (option) => option.id === departingOptionId,
  )
  if (!departingOption) return undefined

  const goldAlternative = resolveGoldStartingEquipmentAlternative(startingEquipment.options)
  if (goldAlternative.status === 'unavailable') return undefined

  return { classId, departingOption, goldAlternative }
}

function listPackageConversionItems(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  context: PackageConversionContext
  departingOptionId: string
}): StartingPackageConversionItem[] {
  const { draft, catalogIndex, context, departingOptionId } = args
  const characterClass = catalogIndex.classes.get(context.classId)
  if (!characterClass) return []

  const resolved = resolveStartingEquipmentOption(
    characterClass,
    context.departingOption,
    draft,
    catalogIndex,
  )
  const removedKeys = new Set(draft.equipment?.removedPackageItemKeys ?? [])

  return resolved.items.flatMap((item, itemIndex) => {
    const packageItemKey = startingEquipmentPackageItemKey(
      context.classId,
      departingOptionId,
      itemIndex,
    )
    if (removedKeys.has(packageItemKey)) return []

    const conversionItem = buildConversionItem({
      classId: context.classId,
      departingOptionId,
      item,
      itemIndex,
    })
    return conversionItem ? [conversionItem] : []
  })
}

function buildConversionBudget(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  targetFunding: ResolvedStartingEquipmentFunding
  items: StartingPackageConversionItem[]
  selectedPackageItemKeys: ReadonlySet<string>
}): StartingPackageConversionBudget {
  const startingCp = wealthToCopper(args.targetFunding.totalStartingWealth)
  const existingPurchaseCostCp = sumPurchaseCostCp(
    args.draft.equipment?.purchases ?? [],
    args.catalogIndex,
  )
  const selectedConversionCostCp = args.items.reduce((total, item) => {
    if (!args.selectedPackageItemKeys.has(item.packageItemKey)) return total
    return total + conversionItemCostCp(item)
  }, 0)

  return {
    startingCp,
    existingPurchaseCostCp,
    selectedConversionCostCp,
    remainingCp: startingCp - existingPurchaseCostCp - selectedConversionCostCp,
  }
}

/** Builds a live conversion preview from the current draft and selected package slots. */
export function buildStartingPackageConversionPreview(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  departingOptionId: string
  selectedPackageItemKeys: ReadonlySet<string>
  targetFunding: ResolvedStartingEquipmentFunding
}): StartingPackageConversionPreview | undefined {
  const context = resolvePackageConversionContext(args)
  if (!context) return undefined

  const items = listPackageConversionItems({
    draft: args.draft,
    catalogIndex: args.catalogIndex,
    context,
    departingOptionId: args.departingOptionId,
  })

  return {
    goldOptionId: context.goldAlternative.option.id,
    goldOptionLabel: context.goldAlternative.option.label,
    items,
    budget: buildConversionBudget({
      draft: args.draft,
      catalogIndex: args.catalogIndex,
      targetFunding: args.targetFunding,
      items,
      selectedPackageItemKeys: args.selectedPackageItemKeys,
    }),
  }
}

/** Returns true when the selected conversion fits budget and has no blocking issues. */
export function canConvertStartingPackageToGold(args: {
  preview: StartingPackageConversionPreview
  selectedPackageItemKeys: ReadonlySet<string>
}): boolean {
  const { preview, selectedPackageItemKeys } = args

  for (const item of preview.items) {
    if (!selectedPackageItemKeys.has(item.packageItemKey)) continue
    if (item.status === 'blocked') return false
  }

  return preview.budget.remainingCp >= 0
}

function pruneDepartingPackageChoiceSelections(args: {
  choiceSelections: CharacterBuilderDraft['choiceSelections']
  classId: string
  departingOptionId: string
  goldOptionId: string
}): CharacterBuilderDraft['choiceSelections'] {
  const { choiceSelections, classId, departingOptionId, goldOptionId } = args
  const next: CharacterBuilderDraft['choiceSelections'] = {}

  const departingPrefix = `class:${classId}:starting-equipment:${departingOptionId}:`
  const topLevelChoiceSetId = startingEquipmentChoiceSetId(classId)

  for (const [key, value] of Object.entries(choiceSelections)) {
    if (key === topLevelChoiceSetId) continue
    if (key.includes(departingPrefix)) continue
    next[key] = value
  }

  next[topLevelChoiceSetId] = [goldOptionId]
  return next
}

function selectedConversionPurchases(args: {
  preview: StartingPackageConversionPreview
  selectedPackageItemKeys: ReadonlySet<string>
  catalogIndex: CharacterBuildCatalogIndex
}): NormalizedCharacterBuilderDraftEquipmentPurchase[] {
  const { preview, selectedPackageItemKeys, catalogIndex } = args
  const purchases: NormalizedCharacterBuilderDraftEquipmentPurchase[] = []

  for (const item of preview.items) {
    if (!selectedPackageItemKeys.has(item.packageItemKey)) continue
    if (item.status === 'blocked') continue

    const equipment = catalogIndex.equipment.get(item.equipmentId)
    if (!equipment) continue

    purchases.push({
      id: createEquipmentPurchaseId(),
      equipmentId: item.equipmentId,
      quantity: item.purchaseQuantity,
      sourceMode: 'startingGold',
      origin: 'packageConversion',
      equipped: item.equipped,
      modifiers: item.modifiers ? structuredClone(item.modifiers) : undefined,
    })
  }

  return purchases
}

function mergeConversionPurchases(args: {
  draft: CharacterBuilderDraft
  preview: StartingPackageConversionPreview
  selectedPackageItemKeys: ReadonlySet<string>
  catalogIndex: CharacterBuildCatalogIndex
}): NormalizedCharacterBuilderDraftEquipmentPurchase[] {
  const normalizedExisting = (normalizeCharacterBuilderDraftPurchases(args.draft).equipment
    ?.purchases ?? []) as NormalizedCharacterBuilderDraftEquipmentPurchase[]

  return selectedConversionPurchases(args).reduce(
    (purchases, incoming) => {
      const equipment = args.catalogIndex.equipment.get(incoming.equipmentId)
      if (!equipment) return purchases

      return mergeCompatiblePurchasedEntries({ purchases, incoming, equipment })
    },
    [...normalizedExisting],
  )
}

function conversionWasCustomized(
  preview: StartingPackageConversionPreview,
  selectedPackageItemKeys: ReadonlySet<string>,
): boolean {
  const selectableKeys = preview.items
    .filter((item) => item.status === 'selectable')
    .map((item) => item.packageItemKey)

  return selectableKeys.some((key) => !selectedPackageItemKeys.has(key))
}

/** Atomic commit: switch to gold, create conversion purchases, and prune package choice keys. */
export function buildStartingPackageConversionPatch(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  departingOptionId: string
  selectedPackageItemKeys: ReadonlySet<string>
  targetFunding: ResolvedStartingEquipmentFunding
}): Partial<CharacterBuilderDraft> | undefined {
  const classId = args.draft.class.classId
  if (!classId) return undefined

  const preview = buildStartingPackageConversionPreview(args)
  if (
    !preview ||
    !canConvertStartingPackageToGold({
      preview,
      selectedPackageItemKeys: args.selectedPackageItemKeys,
    })
  ) {
    return undefined
  }

  return {
    choiceSelections: pruneDepartingPackageChoiceSelections({
      choiceSelections: args.draft.choiceSelections,
      classId,
      departingOptionId: args.departingOptionId,
      goldOptionId: preview.goldOptionId,
    }),
    equipment: {
      mode: 'gold',
      purchases: mergeConversionPurchases({ ...args, preview }),
      removedPackageItemKeys: [],
      customized: conversionWasCustomized(preview, args.selectedPackageItemKeys),
      skipped: false,
    },
  }
}
