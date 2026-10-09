import type { ClassStored } from '../../../../content/classes/class'
import type { Equipment } from '../../../../content/equipment'
import {
  appendEquipmentEntry,
  CHARACTER_EQUIPMENT_INVENTORY_BUCKETS,
  EMPTY_CHARACTER_EQUIPMENT,
  inventoryBucketForEquipment,
  type CharacterEquipment,
  type CharacterEquipmentEntry,
} from '../../../character/sheet/equipment-inventory'
import type { CharacterSelectionSource } from '../../../character/sheet/selection-sources'
import type { CharacterBuildCatalogIndex } from '../../context'
import type {
  CharacterBuilderDraft,
  CharacterBuilderDraftEquipmentPurchase,
  NormalizedCharacterBuilderDraftEquipmentPurchase,
} from '../../draft/draft'
import { normalizeEquipmentPurchase } from '../../equipment/equipment-purchase'
import {
  resolveStartingEquipmentOption,
  type ResolvedStartingEquipmentItem,
} from '../../assembly/assemble-starting-equipment'
import { findAvailableStartingEquipmentOption } from '../../../../content/starting-equipment-availability'
import {
  isStartingGoldOption,
  type StartingEquipmentOption,
} from '../../../../content/starting-equipment'
import { readClassPackageChoice, resolvePackageEntryQuantity } from './class-package-choice'
import { readSelectedStartingEquipmentOptionId } from './resolve-starting-equipment-choice-sets'
import { readMagicItemSelections } from './resolve-magic-item-grant-progress'
import { resolveMagicItemGrantAllowances } from './resolve-magic-item-grant-allowances'
import {
  resolveStartingWealthTierForBuilder,
  standardStartingWealthTableId,
  type StartingWealthRules,
} from '../../../../campaign/rules/starting-wealth'
import { getBuilderSelectedStartingLevel } from '../../progression/builder-level'
import type { SystemRulesetId } from '../../../../primitives/ruleset'
import type { MagicItemRarity } from '../../../../vocab/magic-item/rarity'
import type { MagicItemAllowanceRequirement } from '../../equipment/magic-item-selection'

function grantSelectionSource(): CharacterSelectionSource[] {
  return [{ kind: 'grant' }]
}

function mergeSelectionSources(
  existing: CharacterSelectionSource[] | undefined,
  additional: CharacterSelectionSource[],
): CharacterSelectionSource[] {
  const result = [...(existing ?? [])]
  for (const source of additional) {
    const duplicate = result.some(
      (entry) =>
        entry.kind === source.kind &&
        entry.sourceId === source.sourceId &&
        entry.grantId === source.grantId,
    )
    if (!duplicate) result.push(source)
  }
  return result
}

/** Total assembled quantity for one equipment id across inventory buckets. */
export function inventoryQuantityForEquipmentId(
  inventory: CharacterEquipment,
  equipmentId: string,
): number {
  let total = 0
  for (const bucket of CHARACTER_EQUIPMENT_INVENTORY_BUCKETS) {
    for (const entry of inventory[bucket]) {
      if (entry.equipmentId === equipmentId) total += entry.quantity
    }
  }
  return total
}

/** Whether assembled inventory includes at least one row for the equipment id. */
export function inventoryContainsEquipmentId(
  inventory: CharacterEquipment,
  equipmentId: string,
): boolean {
  return inventoryQuantityForEquipmentId(inventory, equipmentId) > 0
}

function appendGrantsFromDraft(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  inventory: CharacterEquipment,
): CharacterEquipment {
  let result = inventory

  for (const grant of draft.equipment?.grants ?? []) {
    const equipment = catalogIndex.equipment.get(grant.equipmentId)
    if (!equipment) continue
    result =
      grant.contribution === 'additional'
        ? addGrantQuantityOnTop(result, equipment, grant.quantity)
        : ensureGrantQuantityInInventory(result, equipment, grant.quantity)
  }

  return result
}

/** Adds `quantity` on top of package and other channels. */
function addGrantQuantityOnTop(
  inventory: CharacterEquipment,
  equipment: Equipment,
  quantity: number,
): CharacterEquipment {
  if (quantity <= 0) return inventory
  const bucket = inventoryBucketForEquipment(equipment)
  const sources = grantSelectionSource()
  const existingIndex = inventory[bucket].findIndex((entry) => entry.equipmentId === equipment.id)

  if (existingIndex >= 0) {
    const existing = inventory[bucket][existingIndex]!
    const updatedEntry: CharacterEquipmentEntry = {
      ...existing,
      quantity: existing.quantity + quantity,
      sources: mergeSelectionSources(existing.sources, sources),
    }
    return {
      ...inventory,
      [bucket]: inventory[bucket].map((entry, index) =>
        index === existingIndex ? updatedEntry : entry,
      ),
    }
  }

  return appendEquipmentEntry(inventory, equipment, {
    equipmentId: equipment.id,
    quantity,
    sources,
  })
}

/**
 * Ensures assembled quantity is at least `ensureQuantity`. Adds shortfall rows or
 * merges grant provenance onto existing entries without double-counting package rows.
 */
function ensureGrantQuantityInInventory(
  inventory: CharacterEquipment,
  equipment: Equipment,
  ensureQuantity: number,
): CharacterEquipment {
  const bucket = inventoryBucketForEquipment(equipment)
  const sources = grantSelectionSource()
  const currentQuantity = inventoryQuantityForEquipmentId(inventory, equipment.id)
  const targetQuantity = Math.max(currentQuantity, ensureQuantity)
  const shortfall = targetQuantity - currentQuantity
  const existingIndex = inventory[bucket].findIndex((entry) => entry.equipmentId === equipment.id)

  if (existingIndex >= 0) {
    const existing = inventory[bucket][existingIndex]!
    const updatedEntry: CharacterEquipmentEntry = {
      ...existing,
      quantity: existing.quantity + shortfall,
      sources: mergeSelectionSources(existing.sources, sources),
    }
    return {
      ...inventory,
      [bucket]: inventory[bucket].map((entry, index) =>
        index === existingIndex ? updatedEntry : entry,
      ),
    }
  }

  if (shortfall <= 0) return inventory

  return appendEquipmentEntry(inventory, equipment, {
    equipmentId: equipment.id,
    quantity: shortfall,
    sources,
  })
}

type EquipmentDraftContext = {
  classId: string
  characterClass: ClassStored
  option: StartingEquipmentOption
  selectedOptionId: string
}

function resolveEquipmentDraftContext(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): EquipmentDraftContext | null {
  const classId = draft.class.classId
  if (!classId) return null

  const characterClass = catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  if (!characterClass || !startingEquipment) return null

  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!selectedOptionId) return null

  const option = findAvailableStartingEquipmentOption(startingEquipment.options, selectedOptionId)
  if (!option) return null

  return { classId, characterClass, option, selectedOptionId }
}

function appendPackageItemsFromDraft(
  draft: CharacterBuilderDraft,
  context: EquipmentDraftContext,
  catalogIndex: CharacterBuildCatalogIndex,
  inventory: CharacterEquipment,
): CharacterEquipment {
  if (!shouldIncludePackageItems(context.option)) return inventory

  const { classId, characterClass, option, selectedOptionId } = context
  const packageSources = classStartingEquipmentSource(classId, selectedOptionId)
  const items = resolveEffectiveStartingEquipmentPackageItems(
    draft,
    characterClass,
    option,
    catalogIndex,
  )

  return items.reduce((current, { item, quantity }) => {
    return appendResolvedPackageItem(current, item, packageSources, quantity)
  }, inventory)
}

export type EffectiveStartingEquipmentPackageItem = {
  item: ResolvedStartingEquipmentItem
  itemIndex: number
  /** Effective quantity after package entry overrides; always > 0. */
  quantity: number
}

/**
 * Resolved package items with `entryQuantities` overrides applied; items whose
 * effective quantity is ≤ 0 are omitted. `itemIndex` is the authored slot index.
 */
export function resolveEffectiveStartingEquipmentPackageItems(
  draft: CharacterBuilderDraft,
  characterClass: ClassStored,
  option: StartingEquipmentOption,
  catalogIndex: CharacterBuildCatalogIndex,
): EffectiveStartingEquipmentPackageItem[] {
  const resolved = resolveStartingEquipmentOption(characterClass, option, draft, catalogIndex)
  const result: EffectiveStartingEquipmentPackageItem[] = []
  resolved.items.forEach((item, itemIndex) => {
    const quantity = effectivePackageItemQuantity(draft, item)
    if (quantity > 0) result.push({ item, itemIndex, quantity })
  })
  return result
}

function appendPurchasesFromDraft(
  draft: CharacterBuilderDraft,
  context: EquipmentDraftContext,
  catalogIndex: CharacterBuildCatalogIndex,
  inventory: CharacterEquipment,
): CharacterEquipment {
  const { classId, selectedOptionId } = context
  let result = inventory

  for (const purchase of draft.equipment?.purchases ?? []) {
    const equipment = catalogIndex.equipment.get(purchase.equipmentId)
    if (!equipment) continue
    result = appendPurchase(
      result,
      purchase,
      equipment,
      purchaseSources(purchase, classId, selectedOptionId),
    )
  }

  return result
}

/** A magic-item selection the derivation actually counts (allowance and catalog entry resolve). */
export type AppliedMagicItemGrantSelection = {
  allowanceId: string
  equipmentId: string
  quantity: number
  rarity: MagicItemRarity
  requirement: MagicItemAllowanceRequirement
  allowanceSourceId: string
  equipment: Equipment
}

function listAppliedMagicItemSelections(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  startingWealth: StartingWealthRules | undefined
  rulesetId: string
  requirement: MagicItemAllowanceRequirement
}): AppliedMagicItemGrantSelection[] {
  const { draft, catalogIndex, startingWealth, rulesetId, requirement } = args
  const selections = readMagicItemSelections(draft)
  if (selections.length === 0) return []

  const startingLevel = getBuilderSelectedStartingLevel(draft)
  const tier = startingWealth
    ? resolveStartingWealthTierForBuilder(startingWealth, startingLevel)
    : undefined
  if (!tier) return []

  const startingWealthTableId = standardStartingWealthTableId(rulesetId as SystemRulesetId)
  const allowances = resolveMagicItemGrantAllowances({
    startingWealthTableId,
    tier,
    requirement,
  })
  const allowanceById = new Map(allowances.map((entry) => [entry.id, entry]))
  const applied: AppliedMagicItemGrantSelection[] = []

  for (const selection of selections) {
    const allowance = allowanceById.get(selection.allowanceId)
    if (!allowance) continue

    const equipment = catalogIndex.equipment.get(selection.equipmentId)
    if (!equipment) continue

    applied.push({
      allowanceId: selection.allowanceId,
      equipmentId: selection.equipmentId,
      quantity: selection.quantity,
      rarity: allowance.rarity,
      requirement: allowance.requirement,
      allowanceSourceId: allowance.source.sourceId,
      equipment,
    })
  }

  return applied
}

function appendMagicItemGrantsFromDraft(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  startingWealth: StartingWealthRules | undefined,
  rulesetId: string,
  inventory: CharacterEquipment,
  requirement: MagicItemAllowanceRequirement,
): CharacterEquipment {
  const applied = listAppliedMagicItemSelections({
    draft,
    catalogIndex,
    startingWealth,
    rulesetId,
    requirement,
  })

  return applied.reduce((result, selection) => {
    const sources: CharacterSelectionSource[] = [
      {
        kind: 'startingWealthTier',
        sourceId: selection.allowanceSourceId,
        grantId: selection.allowanceId,
      },
    ]

    return appendEquipmentEntry(result, selection.equipment, {
      equipmentId: selection.equipmentId,
      quantity: selection.quantity,
      sources,
    })
  }, inventory)
}

/** Stable key for a package slot: `${classId}:${optionId}:${itemIndex}`. */
export function startingEquipmentPackageItemKey(
  classId: string,
  optionId: string,
  itemIndex: number,
): string {
  return `${classId}:${optionId}:${itemIndex}`
}

function classStartingEquipmentSource(
  classId: string,
  optionId: string,
): CharacterSelectionSource[] {
  return [{ kind: 'classStartingEquipment', sourceId: classId, grantId: optionId }]
}

function startingGoldSource(classId: string, optionId: string): CharacterSelectionSource[] {
  return [{ kind: 'startingGold', sourceId: classId, grantId: optionId }]
}

function purchaseSources(
  purchase: CharacterBuilderDraftEquipmentPurchase,
  classId: string,
  optionId: string,
): CharacterSelectionSource[] {
  if (purchase.sourceMode === 'manual') {
    return [{ kind: 'manual' }]
  }
  return startingGoldSource(classId, optionId)
}

function equipmentEntryFromGrant(
  equipmentId: string,
  grant: Extract<ResolvedStartingEquipmentItem, { kind: 'grant' }>['grant'],
  sources: CharacterSelectionSource[],
): CharacterEquipmentEntry {
  return {
    equipmentId,
    quantity: grant.quantity ?? 1,
    equipped: grant.equipped,
    modifiers: grant.modifiers,
    sources,
  }
}

function authoredPackageItemQuantity(item: ResolvedStartingEquipmentItem): number {
  if (item.kind === 'choice') return 1
  return item.grant.quantity ?? 1
}

function packageContributionId(item: ResolvedStartingEquipmentItem): string | undefined {
  return 'id' in item.grant && typeof item.grant.id === 'string' ? item.grant.id : undefined
}

function effectivePackageItemQuantity(
  draft: CharacterBuilderDraft,
  item: ResolvedStartingEquipmentItem,
): number {
  const authored = authoredPackageItemQuantity(item)
  const choice = readClassPackageChoice(draft.equipment)
  if (choice.state !== 'selected') return authored
  const entryId = packageContributionId(item)
  if (!entryId) return authored
  return resolvePackageEntryQuantity(authored, entryId, choice.overrides.entryQuantities)
}

function appendResolvedPackageItem(
  inventory: CharacterEquipment,
  item: ResolvedStartingEquipmentItem,
  sources: CharacterSelectionSource[],
  quantity: number,
): CharacterEquipment {
  if (item.kind === 'grant') {
    if (!item.equipment) return inventory
    return appendEquipmentEntry(inventory, item.equipment, {
      ...equipmentEntryFromGrant(item.equipmentId, item.grant, sources),
      quantity,
    })
  }

  if (item.kind === 'proficiency_linked_grant') {
    if (item.status !== 'resolved' || !item.equipmentId || !item.equipment) return inventory
    return appendEquipmentEntry(inventory, item.equipment, {
      ...equipmentEntryFromGrant(item.equipmentId, item.grant, sources),
      quantity,
    })
  }

  if (!item.selectedEquipmentId || !item.equipment) return inventory

  return appendEquipmentEntry(inventory, item.equipment, {
    equipmentId: item.selectedEquipmentId,
    quantity,
    sources,
  })
}

function appendPurchase(
  inventory: CharacterEquipment,
  purchase: CharacterBuilderDraftEquipmentPurchase,
  equipment: Equipment,
  sources: CharacterSelectionSource[],
): CharacterEquipment {
  return appendEquipmentEntry(inventory, equipment, {
    equipmentId: purchase.equipmentId,
    quantity: purchase.quantity,
    sources,
  })
}

function shouldIncludePackageItems(option: StartingEquipmentOption): boolean {
  return !isStartingGoldOption(option)
}

function packageRowsForContext(
  draft: CharacterBuilderDraft,
  context: EquipmentDraftContext | null,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterEquipment {
  if (!context) return EMPTY_CHARACTER_EQUIPMENT
  return appendPackageItemsFromDraft(draft, context, catalogIndex, EMPTY_CHARACTER_EQUIPMENT)
}

function rulesetIdForDraft(
  draft: CharacterBuilderDraft,
  context: EquipmentDraftContext | null,
  catalogIndex: CharacterBuildCatalogIndex,
  options: { rulesetId?: SystemRulesetId } | undefined,
): SystemRulesetId | undefined {
  if (options?.rulesetId) return options.rulesetId
  const classId = context?.classId ?? draft.class.classId
  return classId ? catalogIndex.classes.get(classId)?.rulesetId : undefined
}

function purchasesForContext(
  draft: CharacterBuilderDraft,
  context: EquipmentDraftContext | null,
  catalogIndex: CharacterBuildCatalogIndex,
  inventory: CharacterEquipment,
): CharacterEquipment {
  if (!context) return inventory
  return appendPurchasesFromDraft(draft, context, catalogIndex, inventory)
}

type DeriveEquipmentDraftOptions = {
  startingWealth?: StartingWealthRules
  rulesetId?: SystemRulesetId
  magicItemRequirement?: MagicItemAllowanceRequirement
}

/** Package, magic-item, and purchase channels, before generic grants. */
function inventoryBeforeGenericGrants(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: DeriveEquipmentDraftOptions,
): CharacterEquipment {
  const context = resolveEquipmentDraftContext(draft, catalogIndex)
  if (!context && !draft.class.classId) return EMPTY_CHARACTER_EQUIPMENT

  const withPackage = packageRowsForContext(draft, context, catalogIndex)
  const rulesetId = rulesetIdForDraft(draft, context, catalogIndex, options)
  const withMagic =
    rulesetId === undefined
      ? withPackage
      : appendMagicItemGrantsFromDraft(
          draft,
          catalogIndex,
          options?.startingWealth,
          rulesetId,
          withPackage,
          options?.magicItemRequirement ?? 'exact',
        )

  return purchasesForContext(draft, context, catalogIndex, withMagic)
}

function equipmentIdsInInventory(inventory: CharacterEquipment): string[] {
  const ids: string[] = []
  const seen = new Set<string>()
  for (const bucket of CHARACTER_EQUIPMENT_INVENTORY_BUCKETS) {
    for (const entry of inventory[bucket]) {
      if (seen.has(entry.equipmentId)) continue
      seen.add(entry.equipmentId)
      ids.push(entry.equipmentId)
    }
  }
  return ids
}

/**
 * Quantity the generic grant pass adds on top of package, magic-item, and
 * purchase channels. `additional` contributes its full quantity. `ensure`
 * contributes only the shortfall, so a covered grant is omitted. Magic-item
 * choices are not included.
 */
export function resolveGenericEquipmentGrantQuantities(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: DeriveEquipmentDraftOptions,
): ReadonlyMap<string, number> {
  const before = inventoryBeforeGenericGrants(draft, catalogIndex, options)
  const after = appendGrantsFromDraft(draft, catalogIndex, before)
  const quantities = new Map<string, number>()
  const ids = new Set([...equipmentIdsInInventory(before), ...equipmentIdsInInventory(after)])

  for (const equipmentId of ids) {
    const added =
      inventoryQuantityForEquipmentId(after, equipmentId) -
      inventoryQuantityForEquipmentId(before, equipmentId)
    if (added > 0) quantities.set(equipmentId, added)
  }

  return quantities
}

function quantitiesByEquipmentId(inventory: CharacterEquipment): Map<string, number> {
  const quantities = new Map<string, number>()
  for (const equipmentId of equipmentIdsInInventory(inventory)) {
    quantities.set(equipmentId, inventoryQuantityForEquipmentId(inventory, equipmentId))
  }
  return quantities
}

/** Package-channel quantity per equipment id, with entry-quantity overrides applied. */
export function resolvePackageEquipmentQuantities(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): ReadonlyMap<string, number> {
  const context = resolveEquipmentDraftContext(draft, catalogIndex)
  return quantitiesByEquipmentId(packageRowsForContext(draft, context, catalogIndex))
}

/** Magic-item selections the derivation counts — allowance and catalog entry both resolve. */
export function listAppliedMagicItemGrantSelections(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: DeriveEquipmentDraftOptions,
): readonly AppliedMagicItemGrantSelection[] {
  const context = resolveEquipmentDraftContext(draft, catalogIndex)
  if (!context && !draft.class.classId) return []

  const rulesetId = rulesetIdForDraft(draft, context, catalogIndex, options)
  if (rulesetId === undefined) return []

  return listAppliedMagicItemSelections({
    draft,
    catalogIndex,
    startingWealth: options?.startingWealth,
    rulesetId,
    requirement: options?.magicItemRequirement ?? 'exact',
  })
}

/** Purchase rows the derivation counts — a starting option is selected and the item exists. */
export function listCountedEquipmentPurchases(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): readonly NormalizedCharacterBuilderDraftEquipmentPurchase[] {
  const context = resolveEquipmentDraftContext(draft, catalogIndex)
  if (!context) return []

  const purchases = draft.equipment?.purchases ?? []
  return purchases
    .map((_, index) => normalizeEquipmentPurchase(purchases, index))
    .filter((purchase) => catalogIndex.equipment.has(purchase.equipmentId))
}

/**
 * Composes package items (minus removals), magic-item grant selections, draft
 * purchases, and ensure-at-least grants into inventory rows with selection sources.
 */
export function deriveEquipmentDraftEntries(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: DeriveEquipmentDraftOptions,
): CharacterEquipment {
  return appendGrantsFromDraft(
    draft,
    catalogIndex,
    inventoryBeforeGenericGrants(draft, catalogIndex, options),
  )
}
