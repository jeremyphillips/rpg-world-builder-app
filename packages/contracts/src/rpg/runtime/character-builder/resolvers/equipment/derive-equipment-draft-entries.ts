import type { ClassStored } from '../../../../content/classes/class'
import type { Equipment } from '../../../../content/equipment'
import {
  appendEquipmentEntry,
  EMPTY_CHARACTER_EQUIPMENT,
  type CharacterEquipment,
  type CharacterEquipmentEntry,
} from '../../../character/equipment-inventory'
import type { CharacterSelectionSource } from '../../../character/selection-sources'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft, CharacterBuilderDraftEquipmentPurchase } from '../../draft'
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
import { getBuilderSelectedStartingLevel } from '../../builder-level'
import type { SystemRulesetId } from '../../../../primitives/ruleset'

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
 * Composes package items (minus removals), magic-item grant selections, and draft
 * purchases into inventory rows with selection sources.
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

  const withGrants =
    rulesetId !== undefined
      ? appendMagicItemGrantsFromDraft(
          draft,
          catalogIndex,
          options?.startingWealth,
          rulesetId,
          withPackage,
        )
      : withPackage

  return appendPurchasesFromDraft(draft, context, catalogIndex, withGrants)
}
