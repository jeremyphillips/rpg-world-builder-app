import {
  assembleCharacterProficiencies,
  buildChoiceSetId,
  characterPrefersMartialWeaponBrowseOrder,
  deriveEquipmentBudgetSummary,
  deriveEquipmentRecommendations,
  equipmentPoolSummaryLabel,
  formatEquipmentBundleLabel,
  formatEquipmentInventoryPriceLine,
  getInvalidStartingEquipmentProficiencyLinks,
  isEquipmentStackable,
  isProficiencyLinkedStartingEquipmentGrant,
  isStartingGoldOption,
  nestedStartingEquipmentChoiceSetId,
  readSelectedStartingEquipmentOptionId,
  resolveEquipmentPickerItems,
  resolveEquipmentPoolChoiceOptions,
  resolveEquipmentPurchaseId,
  resolveEquipmentPurchaseQuantityLimits,
  resolveStartingEquipmentOption,
  startingEquipmentChoiceSetId,
  startingEquipmentGrantProficiencyChoiceId,
  startingEquipmentPackageItemKey,
  STEP_CHOICE_TYPES_BY_STEP,
  wealthToCopper,
  formatInventorySourceSummary,
  getMagicItemRarityLabel,
  resolveEquipmentAcquisitionBuilderContext,
  resolveEquipmentAcquisitionPlan,
  resolveMagicItemAcquisitionState,
  resolveMagicItemGrantEligibility,
  resolveMagicItemGrantProgressList,
  readMagicItemSelections,
  standardStartingWealthTableId,
  totalSelectedForEquipment,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuilderDraftEquipmentPurchase,
  type CharacterClass,
  type CharacterEquipment,
  type CharacterEquipmentEntry,
  type CharacterSelectionSource,
  formatSelectionSourceLabel,
  type ChoiceSet,
  type Equipment,
  type EquipmentBudgetSummary,
  type EquipmentPickerBrowseSortContext,
  type EquipmentPickerItem,
  type EquipmentStepRemoveTarget,
  type StartingEquipmentOption,
  type StartingEquipmentOptionSummary,
} from '@rpg/contracts'

import { enrichEquipmentPickerItemsWithSearchDocument } from './equipment-picker-search.lib'

export const EQUIPMENT_STEP_NO_VALID_OPTIONS_MESSAGE =
  'No valid starting equipment options are currently available — this may be caused by missing catalog data.'

export const EQUIPMENT_STEP_CONTINUE_WITHOUT_LABEL = 'Continue without starting equipment'

export const EQUIPMENT_STEP_SWITCH_CONFIRM_HEADLINE = 'Change starting equipment?'

export const EQUIPMENT_STEP_SWITCH_CONFIRM_DESCRIPTION =
  'You customized your equipment after choosing a package. Manual purchases stay in your inventory with their original source. Continue switching?'

export const EQUIPMENT_STEP_BROWSE_LABEL = 'Browse equipment'

export const EQUIPMENT_STEP_CUSTOMIZED_MESSAGE =
  'Manual changes are tracked separately from your class starting equipment.'

export const EQUIPMENT_STEP_REMOVE_ITEM_LABEL = 'Remove'

export const EQUIPMENT_PURCHASED_INVENTORY_EMPTY_MESSAGE =
  'No items purchased with starting gold yet.'

export const EQUIPMENT_ADDED_INVENTORY_EMPTY_MESSAGE = 'No additional equipment yet.'

export const EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL = 'Starting Equipment'

export const EQUIPMENT_ADDED_INVENTORY_SECTION_LABEL = 'Added Equipment'

export const EQUIPMENT_PURCHASED_INVENTORY_SECTION_LABEL = 'Purchased Equipment'

export const EQUIPMENT_GOLD_OPTION_STARTING_MESSAGE = 'No package gear in this option'

export const EQUIPMENT_GOLD_OPTION_STARTING_DESCRIPTION_BASE =
  'This character is using the gold option, so all equipment is added through purchases'

export const EQUIPMENT_GOLD_OPTION_STARTING_DESCRIPTION_MAGIC_ITEM_SUFFIX =
  ' or magic item choices.'

export function formatEquipmentGoldOptionStartingDescription(
  includeMagicItemChoices: boolean,
): string {
  if (includeMagicItemChoices) {
    return `${EQUIPMENT_GOLD_OPTION_STARTING_DESCRIPTION_BASE}${EQUIPMENT_GOLD_OPTION_STARTING_DESCRIPTION_MAGIC_ITEM_SUFFIX}`
  }

  return `${EQUIPMENT_GOLD_OPTION_STARTING_DESCRIPTION_BASE}.`
}

export const EQUIPMENT_MAGIC_ITEMS_SECTION_LABEL = 'Magic Items'

export const EQUIPMENT_MAGIC_ITEMS_CHOOSE_LABEL = 'Choose magic items'

export const EQUIPMENT_MAGIC_ITEMS_PROGRESS_LABEL = 'Magic item choices'

export const EQUIPMENT_MAGIC_ITEM_RELEASE_LABEL = 'Release choice'

export const EQUIPMENT_MAGIC_ITEM_REMOVE_PURCHASE_LABEL = 'Remove purchase'

export const EQUIPMENT_INVENTORY_MANAGE_LABEL = 'Manage'

export const EQUIPMENT_INVENTORY_DONE_LABEL = 'Done'

export const EQUIPMENT_INVENTORY_RELEASE_LABEL = 'Release'

export const EQUIPMENT_INVENTORY_RELEASE_ONE_LABEL = 'Release one'

export const EQUIPMENT_INVENTORY_REMOVE_ONE_PURCHASE_LABEL = 'Remove one'

export const EQUIPMENT_INVENTORY_OWNED_COPIES_LABEL = 'Owned copies'

export const EQUIPMENT_INVENTORY_NEXT_COPY_LABEL = 'Next copy'

export const EQUIPMENT_ACQUISITION_QUANTITY_LABEL = 'Quantity to add'

export const EQUIPMENT_ACQUISITION_ADDING_LABEL = 'Adding…'

export const EQUIPMENT_ACQUISITION_BLOCKED_NOTE =
  'No additional copies can be added during character creation.'

export const EQUIPMENT_MAGIC_ITEM_USE_CHOICE_LABEL = 'Use magic item choice'

export function formatMagicItemUseChoicesLabel(quantity: number): string {
  if (quantity === 1) return EQUIPMENT_MAGIC_ITEM_USE_CHOICE_LABEL
  return `Use ${quantity} magic item choices`
}

export const EQUIPMENT_INVENTORY_ACQUIRED_THROUGH_LABEL = 'Acquired through'

export const EQUIPMENT_INVENTORY_ADD_ANOTHER_LABEL = 'Add another'

export function formatEquipmentInventoryManageHeadline(equipmentName: string): string {
  return `Manage ${equipmentName}`
}

export type EquipmentPickerWorkflowMode = 'purchase' | 'magic_items'

export const EQUIPMENT_PACKAGE_CUSTOMIZE_LABEL = 'Customize'

export const EQUIPMENT_PACKAGE_CHANGE_OPTION_LABEL = 'Change option'

export const EQUIPMENT_SELECTED_PACKAGE_EYEBROW = 'Selected package'

export const EQUIPMENT_CHANGE_PACKAGE_LABEL = 'Change package'

export const EQUIPMENT_PACKAGE_REMOVE_FROM_PACKAGE_LABEL = 'Remove from package'

export const EQUIPMENT_PACKAGE_INCLUDED_WEALTH_LABEL = 'included'

export const EQUIPMENT_PACKAGE_CUSTOMIZE_UNAVAILABLE_REASON =
  'No starting-gold alternative is configured for this package.'

export type PackageCustomizeAffordance =
  | { status: 'available' }
  | { status: 'disabled'; reason: string }

export type StartingPackageCategoryGroup = {
  group: keyof CharacterEquipment
  groupLabel: string
  rows: EquipmentInventoryRow[]
}

export type StartingPackageInventoryGroup = {
  optionId: string
  optionLabel: string
  categoryGroups: StartingPackageCategoryGroup[]
  includedWealthLabel?: string
  customize: PackageCustomizeAffordance
}

/** Formats package row titles with quantity prefix (`5 × Dagger`). */
export function formatPackageInventoryRowTitle(name: string, quantity: number): string {
  return `${quantity} × ${name}`
}

export const EQUIPMENT_INCLUDED_TOOL_SECTION_LABEL = 'Included tool'

export const EQUIPMENT_INCLUDED_TOOL_RELATIONSHIP_GUIDANCE =
  'This is the same selection used for your Tool Proficiency.'

export const EQUIPMENT_INCLUDED_TOOL_RESOLVED_ANNOTATION = 'Selected for Tool Proficiencies'

export const EQUIPMENT_INVALID_PROFICIENCY_LINK_MESSAGE =
  'The linked Tool Proficiency choice is unavailable. This class content must be corrected before the package can resolve.'

export const EQUIPMENT_CLASS_OPTIONS_REPLACED_MESSAGE =
  'Class starting options are replaced at this level.'

export function formatEquipmentReplacedStartingWealthTitle(tierLabel?: string): string {
  const label = tierLabel?.trim()
  return label ? `${label} starting wealth` : 'Starting wealth'
}

/** Compact secondary lines for option cards / selected summary (tier + total). */
export function startingEquipmentOptionFundingSummaryLines(
  summary: Pick<StartingEquipmentOptionSummary, 'tierAdjustment' | 'totalStartingWealthLabel'>,
): string[] {
  const lines: string[] = []
  if (summary.tierAdjustment) lines.push(summary.tierAdjustment.label)
  if (summary.totalStartingWealthLabel) lines.push(summary.totalStartingWealthLabel)
  return lines
}

export type EquipmentInventoryRemoveTarget = EquipmentStepRemoveTarget

export type EquipmentInventoryQuantityTarget = {
  kind: 'purchase'
  purchaseId: string
}

export type EquipmentInventoryRow = {
  group: keyof CharacterEquipment
  groupLabel: string
  entry: CharacterEquipmentEntry
  equipment?: Equipment
  equipmentName: string
  sourceLabel: string
  isStackable: boolean
  quantityMode: 'editable' | 'locked'
  maxQuantity?: number
  /** Normalized price line for purchased starting-gold rows (no source label). */
  priceLineLabel?: string
  bundleLabel?: string
  removeLabel: string
  removeTarget?: EquipmentInventoryRemoveTarget
  quantityTarget?: EquipmentInventoryQuantityTarget
  /** Package-switch modal: row is staged at quantity zero but still visible. */
  stagedRemoval?: boolean
}

export function formatEquipmentInventoryRemoveLabel(name: string, quantity: number): string {
  if (quantity <= 1) return `${EQUIPMENT_STEP_REMOVE_ITEM_LABEL} ${name}`
  return `${EQUIPMENT_STEP_REMOVE_ITEM_LABEL} all ${quantity} ${name}`
}

export const EQUIPMENT_INVENTORY_GROUP_LABELS = {
  weapons: 'Weapons',
  armor: 'Armor',
  tools: 'Tools',
  gear: 'Gear',
  magicItems: 'Magic Items',
  vehicles: 'Vehicles',
  mounts: 'Mounts',
} as const satisfies Record<keyof CharacterEquipment, string>

const EQUIPMENT_CHOICE_TYPES = STEP_CHOICE_TYPES_BY_STEP.equipment

export type StartingEquipmentNestedPool = {
  itemIndex: number
  choiceSetId: string
  label: string
  options: { id: string; label: string }[]
}

export type StartingEquipmentProficiencyLink = {
  itemIndex: number
  choiceId: string
  choiceSetId: string
}

export type ProficiencyLinkFieldState = 'pending' | 'resolved' | 'invalid'

/** ChoiceSets owned by the equipment builder step. */
export function choiceSetsForEquipmentStep(choiceSets: readonly ChoiceSet[]): ChoiceSet[] {
  if (!EQUIPMENT_CHOICE_TYPES) return []

  return choiceSets.filter((choiceSet) => EQUIPMENT_CHOICE_TYPES.has(choiceSet.choiceType))
}

export function findStartingEquipmentChoiceSet(
  choiceSets: readonly ChoiceSet[],
  classId: string,
): ChoiceSet | undefined {
  const choiceSetId = startingEquipmentChoiceSetId(classId)
  return choiceSets.find((choiceSet) => choiceSet.id === choiceSetId)
}

export function hasGoldStartingEquipmentOption(
  summaries: readonly StartingEquipmentOptionSummary[],
  characterClass?: CharacterClass,
): boolean {
  if (characterClass) {
    return (
      characterClass.characterCreation?.startingEquipment?.options.some(isStartingGoldOption) ??
      false
    )
  }

  return summaries.some(
    (summary) => summary.wealth !== undefined && summary.orderedItems.length === 0,
  )
}

export function hasSelectableStartingEquipmentOption(
  summaries: readonly StartingEquipmentOptionSummary[],
): boolean {
  return summaries.some((summary) => summary.isSelectable)
}

export function shouldShowEquipmentFallback(
  summaries: readonly StartingEquipmentOptionSummary[],
): boolean {
  return summaries.length > 0 && !hasSelectableStartingEquipmentOption(summaries)
}

export function listNestedPoolsForOption(
  characterClass: CharacterClass,
  optionId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): StartingEquipmentNestedPool[] {
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  const option = startingEquipment?.options.find((entry) => entry.id === optionId)
  if (!option) return []

  return option.items.flatMap((item, itemIndex) => {
    if (item.kind !== 'choice') return []

    return [
      {
        itemIndex,
        choiceSetId: nestedStartingEquipmentChoiceSetId(characterClass.id, optionId, itemIndex),
        label: equipmentPoolSummaryLabel(item.pool),
        options: resolveEquipmentPoolChoiceOptions(
          item.pool,
          catalogIndex,
          characterClass.rulesetId,
        ),
      },
    ]
  })
}

export function areNestedPoolsResolved(
  nestedPools: readonly StartingEquipmentNestedPool[],
  choiceSelections: CharacterBuilderDraft['choiceSelections'],
): boolean {
  if (nestedPools.length === 0) return true

  return nestedPools.every((pool) => (choiceSelections[pool.choiceSetId] ?? []).length > 0)
}

/** Maps package proficiency-linked grants to shared proficiency ChoiceSet references. */
export function listProficiencyLinksForOption(
  characterClass: CharacterClass,
  option: StartingEquipmentOption,
): StartingEquipmentProficiencyLink[] {
  const seenChoiceSetIds = new Set<string>()
  const links: StartingEquipmentProficiencyLink[] = []

  for (const [itemIndex, item] of option.items.entries()) {
    if (item.kind !== 'grant' || !isProficiencyLinkedStartingEquipmentGrant(item)) continue

    const choiceId = startingEquipmentGrantProficiencyChoiceId(item)
    if (!choiceId) continue

    const choiceSetId = buildChoiceSetId('class', characterClass.id, choiceId)
    if (seenChoiceSetIds.has(choiceSetId)) continue
    seenChoiceSetIds.add(choiceSetId)

    links.push({ itemIndex, choiceId, choiceSetId })
  }

  return links
}

export function findChoiceSetById(
  choiceSets: readonly ChoiceSet[],
  choiceSetId: string,
): ChoiceSet | undefined {
  return choiceSets.find((choiceSet) => choiceSet.id === choiceSetId)
}

export function areProficiencyLinksResolved(
  links: readonly StartingEquipmentProficiencyLink[],
  choiceSelections: CharacterBuilderDraft['choiceSelections'],
): boolean {
  if (links.length === 0) return true

  return links.every((link) => (choiceSelections[link.choiceSetId] ?? []).length > 0)
}

/** True when nested package pools and proficiency-linked grants are answered for the option. */
export function isSelectedStartingEquipmentReady(args: {
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  draft: CharacterBuilderDraft
  selectedOptionId: string
}): boolean {
  const { characterClass, catalogIndex, draft, selectedOptionId } = args
  const nestedPools = listNestedPoolsForOption(characterClass, selectedOptionId, catalogIndex)
  const option = characterClass.characterCreation?.startingEquipment?.options.find(
    (entry) => entry.id === selectedOptionId,
  )
  const proficiencyLinks = option ? listProficiencyLinksForOption(characterClass, option) : []

  return (
    areNestedPoolsResolved(nestedPools, draft.choiceSelections) &&
    areProficiencyLinksResolved(proficiencyLinks, draft.choiceSelections)
  )
}

export function resolveProficiencyLinkFieldState(args: {
  link: StartingEquipmentProficiencyLink
  option: StartingEquipmentOption
  classId: string
  characterClass: CharacterClass
  choiceSet: ChoiceSet | undefined
  choiceSelections: CharacterBuilderDraft['choiceSelections']
  catalogIndex: CharacterBuildCatalogIndex
}): ProficiencyLinkFieldState {
  const { link, option, classId, characterClass, choiceSet, choiceSelections, catalogIndex } = args

  const invalidIssue = getInvalidStartingEquipmentProficiencyLinks({
    option,
    classId,
    characterClass,
    choiceSelections,
    catalogIndex,
  }).find((entry) => entry.choiceId === link.choiceId)?.issue

  if (!choiceSet || invalidIssue) return 'invalid'

  return (choiceSelections[link.choiceSetId] ?? []).length > 0 ? 'resolved' : 'pending'
}

export function readSelectedStartingEquipmentOption(
  draft: CharacterBuilderDraft,
  classId: string | undefined,
): string | undefined {
  if (!classId) return undefined
  return readSelectedStartingEquipmentOptionId(draft, classId)
}

export function listEquipmentInventoryRows(
  inventory: CharacterEquipment,
  catalogIndex: CharacterBuildCatalogIndex,
): EquipmentInventoryRow[] {
  const rows: EquipmentInventoryRow[] = []

  for (const group of Object.keys(
    EQUIPMENT_INVENTORY_GROUP_LABELS,
  ) as (keyof CharacterEquipment)[]) {
    for (const entry of inventory[group]) {
      const equipment = catalogIndex.equipment.get(entry.equipmentId)
      rows.push({
        group,
        groupLabel: EQUIPMENT_INVENTORY_GROUP_LABELS[group],
        entry,
        equipment,
        equipmentName: equipment?.name ?? entry.equipmentId,
        sourceLabel: formatSelectionSourceLabel(entry.sources, catalogIndex),
        isStackable: equipment ? isEquipmentStackable(equipment) : false,
        quantityMode: 'locked',
        removeLabel: formatEquipmentInventoryRemoveLabel(
          equipment?.name ?? entry.equipmentId,
          entry.quantity,
        ),
      })
    }
  }

  return rows
}

/** Returns true when a unique item is already present in the draft inventory. */
export function isUniqueEquipmentOwnedInDraft(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  equipmentId: string,
): boolean {
  return listEquipmentInventoryRowsFromDraft(draft, catalogIndex).some(
    (row) => row.entry.equipmentId === equipmentId && !row.isStackable,
  )
}

/** Returns the purchase quantity for an equipment id and source mode, if present. */
export function readEquipmentPurchaseQuantity(
  draft: CharacterBuilderDraft,
  equipmentId: string,
  sourceMode: CharacterBuilderDraftEquipmentPurchase['sourceMode'],
): number {
  const purchase = (draft.equipment?.purchases ?? []).find(
    (entry) => entry.equipmentId === equipmentId && entry.sourceMode === sourceMode,
  )
  return purchase?.quantity ?? 0
}

/** Resolves the purchase row id for a starting-gold inventory item. */
export function resolveStartingGoldPurchaseId(
  draft: CharacterBuilderDraft,
  equipmentId: string,
): string | undefined {
  const purchases = draft.equipment?.purchases ?? []
  const purchaseIndex = purchases.findIndex(
    (entry) => entry.equipmentId === equipmentId && entry.sourceMode === 'startingGold',
  )
  if (purchaseIndex === -1) return undefined
  return resolveEquipmentPurchaseId(purchases, purchaseIndex)
}

export function shouldShowEquipmentBudget(
  draft: CharacterBuilderDraft,
  selectedOptionId: string | undefined,
): boolean {
  return selectedOptionId !== undefined && !draft.equipment?.skipped
}

export function shouldShowEquipmentShopping(
  draft: CharacterBuilderDraft,
  selectedOptionId: string | undefined,
  characterClass?: CharacterClass,
): boolean {
  if (selectedOptionId === undefined || draft.equipment?.skipped) return false

  const option = characterClass?.characterCreation?.startingEquipment?.options.find(
    (entry) => entry.id === selectedOptionId,
  )

  return option !== undefined && isStartingGoldOption(option)
}

export function resolvePurchaseSourceMode(): CharacterBuilderDraftEquipmentPurchase['sourceMode'] {
  return 'startingGold'
}

export function resolveEquipmentStepBudget(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  context?: CharacterBuildContext,
): EquipmentBudgetSummary | undefined {
  return deriveEquipmentBudgetSummary(draft, catalogIndex, {
    startingWealth: context?.characterCreationRules.startingWealth,
  })
}

/**
 * Equipment budget is resolved once per step state via {@link resolveEquipmentStepBudget}.
 * Picker rows, filtering, quantity limits, purchase validation, and displayed budget copy
 * must consume the same `EquipmentBudgetSummary`; lower-level picker resolvers must not
 * independently reconstruct campaign wealth.
 */
export type EquipmentStepPickerItemsResult = {
  items: EquipmentPickerItem[]
  browseSortContext: EquipmentPickerBrowseSortContext
}

export function resolveEquipmentStepPickerItems(args: {
  draft: CharacterBuilderDraft
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  choiceSets: readonly ChoiceSet[]
  /** Resolved via `resolveEquipmentStepBudget` — must match drawer/header/purchase validation. */
  budget?: EquipmentBudgetSummary
}): EquipmentStepPickerItemsResult {
  const { draft, characterClass, catalogIndex, choiceSets, budget } = args
  const proficiencies = assembleCharacterProficiencies(
    draft,
    catalogIndex,
    choiceSets,
    characterClass,
  )
  const recommendations = deriveEquipmentRecommendations({
    characterClass,
    catalogIndex,
    proficiencies,
    classLevel: draft.class.level,
    draft,
    choiceSets,
  })

  return {
    items: enrichEquipmentPickerItemsWithSearchDocument(
      resolveEquipmentPickerItems({
        equipment: [...catalogIndex.equipment.values()],
        proficiencies,
        recommendations,
        budget,
      }),
    ),
    browseSortContext: {
      preferMartialWeaponBrowseOrder: characterPrefersMartialWeaponBrowseOrder(proficiencies),
    },
  }
}

function inventoryGroupForEquipment(
  equipment: NonNullable<ReturnType<CharacterBuildCatalogIndex['equipment']['get']>>,
): keyof CharacterEquipment {
  switch (equipment.kind) {
    case 'weapon':
      return 'weapons'
    case 'armor':
      return 'armor'
    case 'tool':
      return 'tools'
    case 'adventuring_gear':
    case 'service':
      return 'gear'
    case 'magic_item':
      return 'magicItems'
    case 'vehicle':
      return 'vehicles'
    case 'mount':
      return 'mounts'
  }
}

function packageEntryFromResolvedItem(
  item: ReturnType<typeof resolveStartingEquipmentOption>['items'][number],
  sources: CharacterSelectionSource[],
): CharacterEquipmentEntry | undefined {
  if (item.kind === 'grant') {
    if (!item.equipment) return undefined
    return {
      equipmentId: item.equipmentId,
      quantity: item.grant.quantity ?? 1,
      equipped: item.grant.equipped,
      modifiers: item.grant.modifiers,
      sources,
    }
  }

  if (item.kind === 'proficiency_linked_grant') {
    if (item.status !== 'resolved' || !item.equipmentId || !item.equipment) return undefined
    return {
      equipmentId: item.equipmentId,
      quantity: item.grant.quantity ?? 1,
      equipped: item.grant.equipped,
      modifiers: item.grant.modifiers,
      sources,
    }
  }

  if (!item.selectedEquipmentId || !item.equipment) return undefined

  return {
    equipmentId: item.selectedEquipmentId,
    quantity: 1,
    sources,
  }
}

function purchaseSourcesForDraft(
  purchase: CharacterBuilderDraftEquipmentPurchase,
  classId: string,
  optionId: string,
): CharacterSelectionSource[] {
  if (purchase.sourceMode === 'manual') return [{ kind: 'manual' }]
  return [{ kind: 'startingGold', sourceId: classId, grantId: optionId }]
}

function formatPackageGrantSourceLabel(optionLabel: string, quantity: number): string {
  if (quantity <= 1) return `Included with ${optionLabel}`
  return `${quantity} included with ${optionLabel}`
}

function resolveInventoryRowPriceLineLabel(args: {
  equipment: Equipment
  quantity: number
  showCost: boolean
  isPackageRow: boolean
}): string | undefined {
  const { equipment, quantity, showCost, isPackageRow } = args

  if (showCost) {
    return formatEquipmentInventoryPriceLine({
      equipment,
      quantity,
      priceContext: 'startingGold',
    })
  }

  if (isPackageRow) {
    return formatEquipmentInventoryPriceLine({
      equipment,
      quantity,
      priceContext: 'package',
    })
  }

  return undefined
}

function resolveInventoryRowRemoveTarget(args: {
  packageItemKey?: string
  isPurchaseRow: boolean
  purchaseId?: string
}): EquipmentInventoryRemoveTarget | undefined {
  const { packageItemKey, isPurchaseRow, purchaseId } = args

  if (packageItemKey !== undefined) {
    return { kind: 'package', packageItemKey }
  }

  if (isPurchaseRow && purchaseId !== undefined) {
    return { kind: 'purchase', purchaseId }
  }

  return undefined
}

function resolveInventoryRowBundleLabel(
  equipment: Equipment,
  showCost: boolean,
  bundledGear: boolean,
): string | undefined {
  if (showCost && bundledGear) return undefined
  return formatEquipmentBundleLabel(equipment)
}

function buildInventoryRowPresentation(args: {
  entry: CharacterEquipmentEntry
  equipment: Equipment
  sourceLabel: string
  sourceMode?: CharacterBuilderDraftEquipmentPurchase['sourceMode']
  origin?: CharacterBuilderDraftEquipmentPurchase['origin']
  budget?: EquipmentBudgetSummary
  isPurchaseRow: boolean
  purchaseId?: string
  packageItemKey?: string
}): EquipmentInventoryRow {
  const {
    entry,
    equipment,
    sourceLabel,
    sourceMode,
    origin,
    budget,
    isPurchaseRow,
    purchaseId,
    packageItemKey,
  } = args
  const group = inventoryGroupForEquipment(equipment)
  const stackable = isEquipmentStackable(equipment)
  const limits = resolveEquipmentPurchaseQuantityLimits({
    equipment,
    sourceMode,
    origin,
    budget,
    currentQuantity: entry.quantity,
    isPurchaseRow,
  })
  const isPackageRow = packageItemKey !== undefined
  const bundledGear = equipment.kind === 'adventuring_gear' && equipment.bundleSize !== undefined

  return {
    group,
    groupLabel: EQUIPMENT_INVENTORY_GROUP_LABELS[group],
    entry,
    equipment,
    equipmentName: equipment.name,
    sourceLabel,
    isStackable: stackable,
    quantityMode: limits.editable ? 'editable' : 'locked',
    maxQuantity: limits.editable ? limits.max : undefined,
    priceLineLabel: resolveInventoryRowPriceLineLabel({
      equipment,
      quantity: entry.quantity,
      showCost: limits.showCost,
      isPackageRow,
    }),
    bundleLabel: resolveInventoryRowBundleLabel(equipment, limits.showCost, bundledGear),
    removeLabel: formatEquipmentInventoryRemoveLabel(equipment.name, entry.quantity),
    removeTarget: resolveInventoryRowRemoveTarget({
      packageItemKey,
      isPurchaseRow,
      purchaseId,
    }),
    quantityTarget:
      limits.editable && purchaseId !== undefined ? { kind: 'purchase', purchaseId } : undefined,
  }
}

function purchaseRowFromEntry(args: {
  entry: CharacterEquipmentEntry
  equipment: Equipment
  catalogIndex: CharacterBuildCatalogIndex
  purchaseId?: string
  packageItemKey?: string
  sourceMode?: CharacterBuilderDraftEquipmentPurchase['sourceMode']
  origin?: CharacterBuilderDraftEquipmentPurchase['origin']
  budget?: EquipmentBudgetSummary
  packageOptionLabel?: string
}): EquipmentInventoryRow {
  const {
    entry,
    equipment,
    catalogIndex,
    purchaseId,
    packageItemKey,
    sourceMode,
    origin,
    budget,
    packageOptionLabel,
  } = args
  const isPurchaseRow = purchaseId !== undefined
  const sourceLabel =
    packageOptionLabel !== undefined
      ? formatPackageGrantSourceLabel(packageOptionLabel, entry.quantity)
      : formatSelectionSourceLabel(entry.sources, catalogIndex)

  return buildInventoryRowPresentation({
    entry,
    equipment,
    sourceLabel,
    sourceMode,
    origin,
    budget,
    isPurchaseRow,
    purchaseId,
    packageItemKey,
  })
}

function listPackageInventoryRows(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  characterClass: CharacterClass
  option: StartingEquipmentOption
  classId: string
  selectedOptionId: string
  budget?: EquipmentBudgetSummary
}): EquipmentInventoryRow[] {
  const { draft, catalogIndex, characterClass, option, classId, selectedOptionId, budget } = args
  const removedKeys = new Set(draft.equipment?.removedPackageItemKeys ?? [])
  const packageSources: CharacterSelectionSource[] = [
    { kind: 'classStartingEquipment', sourceId: classId, grantId: selectedOptionId },
  ]
  const resolved = resolveStartingEquipmentOption(characterClass, option, draft, catalogIndex)

  return resolved.items.flatMap((item, itemIndex) => {
    const packageItemKey = startingEquipmentPackageItemKey(classId, selectedOptionId, itemIndex)
    if (removedKeys.has(packageItemKey)) return []

    const entry = packageEntryFromResolvedItem(item, packageSources)
    if (!entry) return []

    const equipment = catalogIndex.equipment.get(entry.equipmentId)
    if (!equipment) return []

    return [
      purchaseRowFromEntry({
        entry,
        equipment,
        catalogIndex,
        packageItemKey,
        packageOptionLabel: option.label,
        budget,
      }),
    ]
  })
}

function listPurchaseInventoryRows(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  classId: string
  selectedOptionId: string
  budget?: EquipmentBudgetSummary
}): EquipmentInventoryRow[] {
  const { draft, catalogIndex, classId, selectedOptionId, budget } = args

  return (draft.equipment?.purchases ?? []).flatMap((purchase, purchaseIndex) => {
    const equipment = catalogIndex.equipment.get(purchase.equipmentId)
    if (!equipment) return []

    const sources = purchaseSourcesForDraft(purchase, classId, selectedOptionId)
    const entry: CharacterEquipmentEntry = {
      equipmentId: purchase.equipmentId,
      quantity: purchase.quantity,
      equipped: purchase.equipped,
      modifiers: purchase.modifiers,
      sources,
    }
    const purchaseId = resolveEquipmentPurchaseId(draft.equipment?.purchases ?? [], purchaseIndex)

    return [
      purchaseRowFromEntry({
        entry,
        equipment,
        catalogIndex,
        purchaseId,
        sourceMode: purchase.sourceMode,
        origin: purchase.origin ?? 'picker',
        budget,
      }),
    ]
  })
}

function listMagicItemGrantInventoryRows(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  context: CharacterBuildContext
}): EquipmentInventoryRow[] {
  const { draft, catalogIndex, context } = args
  const acquisition = resolveMagicItemAcquisitionState({
    draft,
    context,
    catalogIndex,
  })

  const allowanceById = new Map(acquisition.allowances.map((entry) => [entry.id, entry]))
  const selections = readMagicItemSelections(draft)

  return selections.flatMap((selection) => {
    const allowance = allowanceById.get(selection.allowanceId)
    const equipment = catalogIndex.equipment.get(selection.equipmentId)
    if (!allowance || !equipment) return []

    const entry: CharacterEquipmentEntry = {
      equipmentId: selection.equipmentId,
      quantity: selection.quantity,
      sources: [
        {
          kind: 'startingWealthTier',
          sourceId: allowance.source.sourceId,
          grantId: selection.allowanceId,
        },
      ],
    }

    return [
      {
        group: 'magicItems' as const,
        groupLabel: EQUIPMENT_INVENTORY_GROUP_LABELS.magicItems,
        entry,
        equipment,
        equipmentName: equipment.name,
        sourceLabel: `${getMagicItemRarityLabel(allowance.rarity)} choice`,
        isStackable: isEquipmentStackable(equipment),
        quantityMode: 'locked' as const,
        removeLabel: `${EQUIPMENT_MAGIC_ITEM_RELEASE_LABEL} ${equipment.name}`,
        removeTarget: {
          kind: 'magicItemGrant' as const,
          allowanceId: selection.allowanceId,
          equipmentId: selection.equipmentId,
        },
      },
    ]
  })
}

export function resolveEquipmentAcquisitionContext(args: {
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
}) {
  return resolveEquipmentAcquisitionBuilderContext({
    context: args.context,
    catalogIndex: args.catalogIndex,
    startingWealthTableId: standardStartingWealthTableId(args.context.rulesetId),
  })
}

export function resolveEquipmentStepAcquisitionState(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
}) {
  return resolveMagicItemAcquisitionState({
    draft: args.draft,
    context: args.context,
    catalogIndex: args.catalogIndex,
  })
}

export function shouldShowMagicItemGrants(
  acquisition: ReturnType<typeof resolveMagicItemAcquisitionState>,
): boolean {
  return acquisition.allowances.length > 0
}

export function shouldShowEquipmentPurchaseWorkflow(
  draft: CharacterBuilderDraft,
  selectedOptionId: string | undefined,
  budget?: EquipmentBudgetSummary,
): boolean {
  if (selectedOptionId === undefined || draft.equipment?.skipped) return false
  if (!budget) return false
  return wealthToCopper(budget.starting) > 0
}

export function resolveEquipmentPickerWorkflowModes(args: {
  showPurchase: boolean
  showMagicItems: boolean
}): EquipmentPickerWorkflowMode[] {
  const modes: EquipmentPickerWorkflowMode[] = []
  if (args.showPurchase) modes.push('purchase')
  if (args.showMagicItems) modes.push('magic_items')
  return modes
}

export function formatMagicItemGrantProgressLabel(
  progress: ReturnType<typeof resolveMagicItemGrantProgressList>,
): string {
  if (progress.length === 0) return ''

  const parts = progress.map(
    (entry) => `${entry.selected}/${entry.capacity} ${getMagicItemRarityLabel(entry.rarity)}`,
  )
  return parts.join(' · ')
}

export function resolveEquipmentOwnedQuantity(args: {
  equipmentId: string
  draft: CharacterBuilderDraft
}): number {
  const grantQuantity = readMagicItemGrantQuantity(args.draft, args.equipmentId)
  const purchaseQuantity = (args.draft.equipment?.purchases ?? [])
    .filter((row) => row.equipmentId === args.equipmentId)
    .reduce((sum, row) => sum + row.quantity, 0)

  return grantQuantity + purchaseQuantity
}

export function isMagicItemPickerItemVisible(args: {
  equipment: Equipment
  draft: CharacterBuilderDraft
  context: ReturnType<typeof resolveEquipmentAcquisitionContext>
  focusedAllowanceId?: string
}): boolean {
  const { equipment, draft, context, focusedAllowanceId } = args
  if (equipment.kind !== 'magic_item' || !equipment.rarity) return false

  if (resolveEquipmentOwnedQuantity({ equipmentId: equipment.id, draft }) > 0) return true

  if (!focusedAllowanceId) return true

  const focusedRarity = focusedAllowanceId.split(':').at(-1)
  if (focusedRarity && equipment.rarity !== focusedRarity) return false

  const eligibility = resolveMagicItemGrantEligibility({
    equipment,
    draft,
    context,
    focusedAllowanceId,
  })

  if (eligibility.eligible) return true
  if (eligibility.reason === 'allowance_full') return true

  return false
}

export function readMagicItemGrantSelection(args: {
  draft: CharacterBuilderDraft
  allowanceId: string
  equipmentId: string
}): { quantity: number } | undefined {
  const selection = readMagicItemSelections(args.draft).find(
    (row) => row.allowanceId === args.allowanceId && row.equipmentId === args.equipmentId,
  )

  if (!selection) return undefined
  return { quantity: selection.quantity }
}

export function previewMagicItemAcquisitionPlan(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  equipmentId: string
  requestedQuantity: number
}) {
  const equipment = args.catalogIndex.equipment.get(args.equipmentId)
  if (!equipment) return undefined

  return resolveEquipmentAcquisitionPlan({
    draft: args.draft,
    context: resolveEquipmentAcquisitionContext({
      context: args.context,
      catalogIndex: args.catalogIndex,
    }),
    equipment,
    requestedQuantity: args.requestedQuantity,
  })
}

export function readMagicItemGrantQuantity(
  draft: CharacterBuilderDraft,
  equipmentId: string,
): number {
  return totalSelectedForEquipment(readMagicItemSelections(draft), equipmentId)
}

export function formatAggregatedInventoryProvenance(
  draft: CharacterBuilderDraft,
  _catalogIndex: CharacterBuildCatalogIndex,
  _context: CharacterBuildContext,
  equipmentId: string,
): string | undefined {
  const grantQty = readMagicItemGrantQuantity(draft, equipmentId)
  const purchaseQty = readEquipmentPurchaseQuantity(draft, equipmentId, 'startingGold')
  if (grantQty === 0 && purchaseQty === 0) return undefined

  const parts: string[] = []
  if (grantQty > 0) parts.push(`${grantQty} grant choice`)
  if (purchaseQty > 0) parts.push(`${purchaseQty} purchased`)

  return formatInventorySourceSummary([
    ...(grantQty > 0 ? [{ kind: 'startingWealthTier' as const, quantity: grantQty }] : []),
    ...(purchaseQty > 0 ? [{ kind: 'startingGold' as const, quantity: purchaseQty }] : []),
  ])
}

/** Lists inventory rows with removal targets derived from draft decisions. */
export function listEquipmentInventoryRowsFromDraft(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  budget?: EquipmentBudgetSummary,
  context?: CharacterBuildContext,
): EquipmentInventoryRow[] {
  const classId = draft.class.classId
  if (!classId) return []

  const characterClass = catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!characterClass || !startingEquipment || !selectedOptionId) return []

  const option = startingEquipment.options.find((entry) => entry.id === selectedOptionId)
  if (!option) return []

  const packageRows = isStartingGoldOption(option)
    ? []
    : listPackageInventoryRows({
        draft,
        catalogIndex,
        characterClass,
        option,
        classId,
        selectedOptionId,
        budget,
      })

  return [
    ...packageRows,
    ...(context ? listMagicItemGrantInventoryRows({ draft, catalogIndex, context }) : []),
    ...listPurchaseInventoryRows({ draft, catalogIndex, classId, selectedOptionId, budget }),
  ]
}

export function listEquipmentInventoryRowsForEquipment(args: {
  equipmentId: string
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  context?: CharacterBuildContext
}): EquipmentInventoryRow[] {
  return listEquipmentInventoryRowsFromDraft(
    args.draft,
    args.catalogIndex,
    args.budget,
    args.context,
  ).filter((row) => row.entry.equipmentId === args.equipmentId)
}
