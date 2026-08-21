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
} from '../../draft/draft'
import {
  resolveStartingEquipmentOption,
  type ResolvedStartingEquipmentItem,
} from '../../assembly/assemble-starting-equipment'
import {
  isStartingGoldOption,
  type StartingEquipmentOption,
} from '../../../../content/starting-equipment'
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
    result = ensureGrantQuantityInInventory(result, equipment, grant.quantity)
  }

  return result
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

  const option = startingEquipment.options.find((entry) => entry.id === selectedOptionId)
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
  const removedKeys = new Set(draft.equipment?.removedPackageItemKeys ?? [])
  const packageSources = classStartingEquipmentSource(classId, selectedOptionId)
  const resolved = resolveStartingEquipmentOption(characterClass, option, draft, catalogIndex)

  return resolved.items.reduce((current, item, itemIndex) => {
    const key = startingEquipmentPackageItemKey(classId, selectedOptionId, itemIndex)
    if (removedKeys.has(key)) return current
    return appendResolvedPackageItem(current, item, packageSources)
  }, inventory)
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

function appendMagicItemGrantsFromDraft(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  startingWealth: StartingWealthRules | undefined,
  rulesetId: string,
  inventory: CharacterEquipment,
): CharacterEquipment {
  const selections = readMagicItemSelections(draft)
  if (selections.length === 0) return inventory

  const startingLevel = getBuilderSelectedStartingLevel(draft)
  const tier = startingWealth
    ? resolveStartingWealthTierForBuilder(startingWealth, startingLevel)
    : undefined
  if (!tier) return inventory

  const startingWealthTableId = standardStartingWealthTableId(rulesetId as SystemRulesetId)
  const allowances = resolveMagicItemGrantAllowances({ startingWealthTableId, tier })
  const allowanceById = new Map(allowances.map((entry) => [entry.id, entry]))

  let result = inventory

  for (const selection of selections) {
    const allowance = allowanceById.get(selection.allowanceId)
    if (!allowance) continue

    const equipment = catalogIndex.equipment.get(selection.equipmentId)
    if (!equipment) continue

    const sources: CharacterSelectionSource[] = [
      {
        kind: 'startingWealthTier',
        sourceId: allowance.source.sourceId,
        grantId: selection.allowanceId,
      },
    ]

    result = appendEquipmentEntry(result, equipment, {
      equipmentId: selection.equipmentId,
      quantity: selection.quantity,
      sources,
    })
  }

  return result
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

function appendResolvedPackageItem(
  inventory: CharacterEquipment,
  item: ResolvedStartingEquipmentItem,
  sources: CharacterSelectionSource[],
): CharacterEquipment {
  if (item.kind === 'grant') {
    if (!item.equipment) return inventory
    return appendEquipmentEntry(
      inventory,
      item.equipment,
      equipmentEntryFromGrant(item.equipmentId, item.grant, sources),
    )
  }

  if (item.kind === 'proficiency_linked_grant') {
    if (item.status !== 'resolved' || !item.equipmentId || !item.equipment) return inventory
    return appendEquipmentEntry(
      inventory,
      item.equipment,
      equipmentEntryFromGrant(item.equipmentId, item.grant, sources),
    )
  }

  if (!item.selectedEquipmentId || !item.equipment) return inventory

  return appendEquipmentEntry(inventory, item.equipment, {
    equipmentId: item.selectedEquipmentId,
    quantity: 1,
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

/**
 * Composes package items (minus removals), magic-item grant selections, draft
 * purchases, and ensure-at-least grants into inventory rows with selection sources.
 */
export function deriveEquipmentDraftEntries(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: { startingWealth?: StartingWealthRules; rulesetId?: SystemRulesetId },
): CharacterEquipment {
  const context = resolveEquipmentDraftContext(draft, catalogIndex)
  if (!context) return EMPTY_CHARACTER_EQUIPMENT

  const withPackage = appendPackageItemsFromDraft(
    draft,
    context,
    catalogIndex,
    EMPTY_CHARACTER_EQUIPMENT,
  )

  const characterClass = catalogIndex.classes.get(context.classId)
  const rulesetId = options?.rulesetId ?? characterClass?.rulesetId

  const withMagicGrants =
    rulesetId !== undefined
      ? appendMagicItemGrantsFromDraft(
          draft,
          catalogIndex,
          options?.startingWealth,
          rulesetId,
          withPackage,
        )
      : withPackage

  const withPurchases = appendPurchasesFromDraft(draft, context, catalogIndex, withMagicGrants)

  return appendGrantsFromDraft(draft, catalogIndex, withPurchases)
}
