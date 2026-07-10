import {
  assembleCharacterProficiencies,
  buildChoiceSetId,
  characterPrefersMartialWeaponBrowseOrder,
  deriveEquipmentBudgetSummary,
  deriveEquipmentRecommendations,
  equipmentPoolSummaryLabel,
  formatWealth,
  getInvalidStartingEquipmentProficiencyLinks,
  isEquipmentStackable,
  isProficiencyLinkedStartingEquipmentGrant,
  maxAffordableEquipmentQuantity,
  nestedStartingEquipmentChoiceSetId,
  readSelectedStartingEquipmentOptionId,
  resolveEquipmentPickerItems,
  resolveEquipmentPoolChoiceOptions,
  resolveStartingEquipmentOption,
  startingEquipmentChoiceSetId,
  startingEquipmentGrantProficiencyChoiceId,
  startingEquipmentPackageItemKey,
  STEP_CHOICE_TYPES_BY_STEP,
  type CharacterBuildCatalogIndex,
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
  type StartingEquipmentOption,
  type StartingEquipmentOptionSummary,
  type StartingEquipmentOptionSummaryGrant,
  type StartingEquipmentOptionSummaryItem,
} from '@rpg/contracts'

export const STARTING_EQUIPMENT_GOLD_OPTION_ID = 'gold'

export const EQUIPMENT_STEP_NO_VALID_OPTIONS_MESSAGE =
  'No valid starting equipment options are currently available — this may be caused by missing catalog data.'

export const EQUIPMENT_STEP_CONTINUE_WITHOUT_LABEL = 'Continue without starting equipment'

export const EQUIPMENT_STEP_SWITCH_CONFIRM_HEADLINE = 'Change starting equipment?'

export const EQUIPMENT_STEP_SWITCH_CONFIRM_DESCRIPTION =
  'You customized your equipment after choosing a package. Manual purchases stay in your inventory with their original source. Continue switching?'

export const EQUIPMENT_STEP_BROWSE_LABEL = 'Browse equipment'

export const EQUIPMENT_STEP_CUSTOMIZE_LABEL = 'Customize equipment'

export const EQUIPMENT_STEP_CUSTOMIZED_MESSAGE =
  'Manual changes are tracked separately from your class starting equipment.'

export const EQUIPMENT_STEP_REMOVE_ITEM_LABEL = 'Remove'

export const EQUIPMENT_INCLUDED_TOOL_SECTION_LABEL = 'Included tool'

export const EQUIPMENT_INCLUDED_TOOL_RELATIONSHIP_GUIDANCE =
  'This is the same selection used for your Tool Proficiency.'

export const EQUIPMENT_INCLUDED_TOOL_RESOLVED_ANNOTATION = 'Selected for Tool Proficiencies'

export const EQUIPMENT_INVALID_PROFICIENCY_LINK_MESSAGE =
  'The linked Tool Proficiency choice is unavailable. This class content must be corrected before the package can resolve.'

export type EquipmentPickerFlow = 'gold' | 'customize'

export type EquipmentInventoryRemoveTarget =
  | { kind: 'package'; packageItemKey: string }
  | { kind: 'purchase'; purchaseIndex: number }

export type EquipmentInventoryQuantityTarget = {
  kind: 'purchase'
  purchaseIndex: number
}

export type EquipmentInventoryRow = {
  group: keyof CharacterEquipment
  groupLabel: string
  entry: CharacterEquipmentEntry
  equipment?: Equipment
  equipmentName: string
  sourceLabel: string
  isStackable: boolean
  removeTarget?: EquipmentInventoryRemoveTarget
  quantityTarget?: EquipmentInventoryQuantityTarget
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

export function isStartingGoldOptionId(optionId: string): boolean {
  return optionId === STARTING_EQUIPMENT_GOLD_OPTION_ID
}

export function hasGoldStartingEquipmentOption(
  summaries: readonly StartingEquipmentOptionSummary[],
): boolean {
  return summaries.some((summary) => isStartingGoldOptionId(summary.optionId))
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

export function formatStartingEquipmentWealth(
  wealth: StartingEquipmentOptionSummary['wealth'],
): string | undefined {
  if (!wealth) return undefined
  return formatWealth({
    cp: wealth.cp ?? 0,
    sp: wealth.sp ?? 0,
    gp: wealth.gp ?? 0,
    pp: wealth.pp ?? 0,
  })
}

function summarizeGrantItem(item: StartingEquipmentOptionSummaryGrant): string {
  const quantity = item.quantity > 1 ? `${item.quantity}× ` : ''
  const name = item.equipment?.name ?? item.equipmentSlug
  const equipped = item.equipped ? ' (equipped)' : ''
  return `${quantity}${name}${equipped}`
}

function summarizeChoiceItem(
  item: Extract<StartingEquipmentOptionSummaryItem, { kind: 'choice' }>,
): string {
  return `${item.choose}× ${item.poolLabel}`
}

function summarizeProficiencyLinkedGrantItem(
  item: Extract<StartingEquipmentOptionSummaryItem, { kind: 'proficiency_linked_grant' }>,
): string {
  if (item.status === 'invalid') {
    return item.issue ?? `Invalid link to "${item.choiceLabel}"`
  }
  if (item.status === 'resolved' && item.resolvedEquipment) {
    return item.resolvedEquipment.name
  }
  return `Selection from "${item.choiceLabel}"`
}

export function formatStartingEquipmentOptionMeta(
  summary: StartingEquipmentOptionSummary,
): string[] {
  const meta: string[] = []

  for (const group of Object.keys(
    EQUIPMENT_INVENTORY_GROUP_LABELS,
  ) as (keyof CharacterEquipment)[]) {
    for (const item of summary.itemsByGroup[group]) {
      if (item.kind === 'grant') {
        meta.push(summarizeGrantItem(item))
      } else if (item.kind === 'proficiency_linked_grant') {
        meta.push(summarizeProficiencyLinkedGrantItem(item))
      } else {
        meta.push(summarizeChoiceItem(item))
      }
    }
  }

  const wealth = formatStartingEquipmentWealth(summary.wealth)
  if (wealth) meta.push(wealth)

  return meta
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

/** @deprecated Use {@link formatSelectionSourceLabel} from `@rpg/contracts`. */
export function formatEquipmentSourceLabel(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  return formatSelectionSourceLabel(sources, catalogIndex)
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
        sourceLabel: formatEquipmentSourceLabel(entry.sources, catalogIndex),
        isStackable: equipment ? isEquipmentStackable(equipment) : false,
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

export function resolveMaxAffordablePurchaseQuantity(args: {
  equipment: Equipment
  budget: EquipmentBudgetSummary
  currentQuantity: number
}): number {
  return maxAffordableEquipmentQuantity(args.equipment, args.budget, args.currentQuantity)
}

export function buildEquipmentSkipPatch(): CharacterBuilderDraft['equipment'] {
  return {
    mode: 'package',
    purchases: [],
    removedPackageItemKeys: [],
    customized: false,
    skipped: true,
  }
}

export function buildEquipmentSelectionPatch(args: {
  draft: CharacterBuilderDraft
  classId: string
  optionId: string
  choiceSetId: string
  nestedSelections: CharacterBuilderDraft['choiceSelections']
}): Partial<CharacterBuilderDraft> {
  const { draft, optionId, choiceSetId, nestedSelections } = args
  const isGold = isStartingGoldOptionId(optionId)

  return {
    choiceSelections: {
      ...draft.choiceSelections,
      ...nestedSelections,
      [choiceSetId]: [optionId],
    },
    equipment: {
      mode: isGold ? 'gold' : 'package',
      purchases: draft.equipment?.purchases ?? [],
      removedPackageItemKeys: [],
      customized: draft.equipment?.customized ?? false,
      skipped: false,
    },
  }
}

export function shouldShowEquipmentShopping(
  draft: CharacterBuilderDraft,
  selectedOptionId: string | undefined,
): boolean {
  return Boolean(selectedOptionId) && !draft.equipment?.skipped
}

export function resolveEquipmentPickerFlow(
  selectedOptionId: string | undefined,
): EquipmentPickerFlow | undefined {
  if (!selectedOptionId) return undefined
  return isStartingGoldOptionId(selectedOptionId) ? 'gold' : 'customize'
}

export function resolvePurchaseSourceMode(
  flow: EquipmentPickerFlow,
): CharacterBuilderDraftEquipmentPurchase['sourceMode'] {
  return flow === 'gold' ? 'startingGold' : 'manual'
}

export function resolveEquipmentStepBudget(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): EquipmentBudgetSummary | undefined {
  return deriveEquipmentBudgetSummary(draft, catalogIndex)
}

export type EquipmentStepPickerItemsResult = {
  items: EquipmentPickerItem[]
  browseSortContext: EquipmentPickerBrowseSortContext
}

export function resolveEquipmentStepPickerItems(args: {
  draft: CharacterBuilderDraft
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  choiceSets: readonly ChoiceSet[]
}): EquipmentStepPickerItemsResult {
  const { draft, characterClass, catalogIndex, choiceSets } = args
  const proficiencies = assembleCharacterProficiencies(
    draft,
    catalogIndex,
    choiceSets,
    characterClass,
  )
  const budget = deriveEquipmentBudgetSummary(draft, catalogIndex)
  const recommendations = deriveEquipmentRecommendations({
    characterClass,
    catalogIndex,
    proficiencies,
    classLevel: draft.class.level,
    draft,
    choiceSets,
  })

  return {
    items: resolveEquipmentPickerItems({
      equipment: [...catalogIndex.equipment.values()],
      proficiencies,
      recommendations,
      budget,
    }),
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

function purchaseRowFromEntry(args: {
  entry: CharacterEquipmentEntry
  equipment: Equipment
  catalogIndex: CharacterBuildCatalogIndex
  purchaseIndex?: number
  packageItemKey?: string
}): EquipmentInventoryRow {
  const { entry, equipment, catalogIndex, purchaseIndex, packageItemKey } = args
  const group = inventoryGroupForEquipment(equipment)
  const stackable = isEquipmentStackable(equipment)

  return {
    group,
    groupLabel: EQUIPMENT_INVENTORY_GROUP_LABELS[group],
    entry,
    equipment,
    equipmentName: equipment.name,
    sourceLabel: formatEquipmentSourceLabel(entry.sources, catalogIndex),
    isStackable: stackable,
    removeTarget:
      packageItemKey !== undefined
        ? { kind: 'package', packageItemKey }
        : stackable
          ? undefined
          : { kind: 'purchase', purchaseIndex: purchaseIndex! },
    quantityTarget:
      purchaseIndex !== undefined && stackable ? { kind: 'purchase', purchaseIndex } : undefined,
  }
}

function listPackageInventoryRows(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  characterClass: CharacterClass
  option: StartingEquipmentOption
  classId: string
  selectedOptionId: string
}): EquipmentInventoryRow[] {
  const { draft, catalogIndex, characterClass, option, classId, selectedOptionId } = args
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

    return [purchaseRowFromEntry({ entry, equipment, catalogIndex, packageItemKey })]
  })
}

function listPurchaseInventoryRows(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  classId: string
  selectedOptionId: string
}): EquipmentInventoryRow[] {
  const { draft, catalogIndex, classId, selectedOptionId } = args

  return (draft.equipment?.purchases ?? []).flatMap((purchase, purchaseIndex) => {
    const equipment = catalogIndex.equipment.get(purchase.equipmentId)
    if (!equipment) return []

    const sources = purchaseSourcesForDraft(purchase, classId, selectedOptionId)
    const entry: CharacterEquipmentEntry = {
      equipmentId: purchase.equipmentId,
      quantity: purchase.quantity,
      sources,
    }

    return [
      {
        ...purchaseRowFromEntry({ entry, equipment, catalogIndex, purchaseIndex }),
        sourceLabel: formatEquipmentSourceLabel(sources, catalogIndex),
      },
    ]
  })
}

function canAddEquipmentPurchase(args: {
  equipment: Equipment
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  equipmentId: string
  sourceMode: CharacterBuilderDraftEquipmentPurchase['sourceMode']
  quantity: number
}): boolean {
  const { equipment, draft, catalogIndex, equipmentId, sourceMode, quantity } = args
  if (!isEquipmentStackable(equipment)) {
    if (quantity !== 1) return false
    if (readEquipmentPurchaseQuantity(draft, equipmentId, sourceMode) > 0) return false
    if (isUniqueEquipmentOwnedInDraft(draft, catalogIndex, equipmentId)) return false
  }
  return true
}

/** Lists inventory rows with removal targets derived from draft decisions. */
export function listEquipmentInventoryRowsFromDraft(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): EquipmentInventoryRow[] {
  const classId = draft.class.classId
  if (!classId) return []

  const characterClass = catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!characterClass || !startingEquipment || !selectedOptionId) return []

  const option = startingEquipment.options.find((entry) => entry.id === selectedOptionId)
  if (!option) return []

  const packageRows =
    draft.equipment?.mode === 'gold'
      ? []
      : listPackageInventoryRows({
          draft,
          catalogIndex,
          characterClass,
          option,
          classId,
          selectedOptionId,
        })

  return [
    ...packageRows,
    ...listPurchaseInventoryRows({ draft, catalogIndex, classId, selectedOptionId }),
  ]
}

function upsertEquipmentPurchase(
  purchases: CharacterBuilderDraftEquipmentPurchase[],
  equipmentId: string,
  sourceMode: CharacterBuilderDraftEquipmentPurchase['sourceMode'],
  quantity: number,
): CharacterBuilderDraftEquipmentPurchase[] {
  const existingIndex = purchases.findIndex(
    (purchase) => purchase.equipmentId === equipmentId && purchase.sourceMode === sourceMode,
  )

  if (existingIndex < 0) {
    return [...purchases, { equipmentId, quantity, sourceMode }]
  }

  const existing = purchases[existingIndex]!
  return purchases.map((purchase, index) =>
    index === existingIndex ? { ...existing, quantity: existing.quantity + quantity } : purchase,
  )
}

function buildEquipmentDraftFromPurchase(args: {
  draft: CharacterBuilderDraft
  purchases: CharacterBuilderDraftEquipmentPurchase[]
  sourceMode: CharacterBuilderDraftEquipmentPurchase['sourceMode']
}): CharacterBuilderDraft['equipment'] {
  const { draft, purchases, sourceMode } = args

  return {
    mode: draft.equipment?.mode ?? (sourceMode === 'startingGold' ? 'gold' : 'package'),
    purchases,
    removedPackageItemKeys: draft.equipment?.removedPackageItemKeys ?? [],
    customized: sourceMode === 'manual' ? true : (draft.equipment?.customized ?? false),
    skipped: false,
  }
}

export function buildEquipmentAddPurchasePatch(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  equipmentId: string
  sourceMode: CharacterBuilderDraftEquipmentPurchase['sourceMode']
  quantity?: number
}): Partial<CharacterBuilderDraft> | undefined {
  const { draft, catalogIndex, equipmentId, sourceMode, quantity = 1 } = args
  const equipment = catalogIndex.equipment.get(equipmentId)

  if (
    quantity < 1 ||
    !equipment ||
    !canAddEquipmentPurchase({ equipment, draft, catalogIndex, equipmentId, sourceMode, quantity })
  ) {
    return undefined
  }

  return {
    equipment: buildEquipmentDraftFromPurchase({
      draft,
      sourceMode,
      purchases: upsertEquipmentPurchase(
        [...(draft.equipment?.purchases ?? [])],
        equipmentId,
        sourceMode,
        quantity,
      ),
    }),
  }
}

export function buildEquipmentSetPurchaseQuantityPatch(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  purchaseIndex: number
  quantity: number
}): Partial<CharacterBuilderDraft> | undefined {
  const { draft, catalogIndex, purchaseIndex, quantity } = args
  const current = draft.equipment
  if (!current) return undefined

  const purchase = current.purchases[purchaseIndex]
  if (!purchase) return undefined

  const equipment = catalogIndex.equipment.get(purchase.equipmentId)
  if (!equipment || !isEquipmentStackable(equipment)) return undefined

  if (quantity < 1) {
    return buildEquipmentRemoveEntryPatch({
      draft,
      target: { kind: 'purchase', purchaseIndex },
    })
  }

  const purchases = current.purchases.map((entry, index) =>
    index === purchaseIndex ? { ...entry, quantity } : entry,
  )

  return {
    equipment: {
      ...current,
      purchases,
    },
  }
}

export function buildEquipmentRemoveEntryPatch(args: {
  draft: CharacterBuilderDraft
  target: EquipmentInventoryRemoveTarget
}): Partial<CharacterBuilderDraft> {
  const { draft, target } = args
  const current = draft.equipment ?? {
    mode: 'package' as const,
    purchases: [],
    removedPackageItemKeys: [],
    customized: false,
  }

  if (target.kind === 'package') {
    const removedPackageItemKeys = current.removedPackageItemKeys.includes(target.packageItemKey)
      ? current.removedPackageItemKeys
      : [...current.removedPackageItemKeys, target.packageItemKey]

    return {
      equipment: {
        ...current,
        removedPackageItemKeys,
        customized: true,
      },
    }
  }

  const purchases = current.purchases.flatMap((purchase, index) => {
    if (index !== target.purchaseIndex) return [purchase]
    if (purchase.quantity > 1) return [{ ...purchase, quantity: purchase.quantity - 1 }]
    return []
  })

  return {
    equipment: {
      ...current,
      purchases,
    },
  }
}
