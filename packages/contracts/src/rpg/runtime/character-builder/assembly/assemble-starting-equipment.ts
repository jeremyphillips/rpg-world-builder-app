import type { Equipment } from '../../../content/equipment'
import type {
  EquipmentChoiceGrant,
  GrantedEquipmentItem,
} from '../../../content/lib/equipment-grant'
import type { CharacterWealthGrant } from '../../../content/lib/wealth-grant'
import type { StartingEquipmentOption } from '../../../content/starting-equipment'
import type { CharacterClass } from '../../../content/classes/class'
import { toEquipmentContentId } from '../../creature/equipment'
import {
  appendEquipmentEntry,
  characterWealthFromGrant,
  EMPTY_CHARACTER_EQUIPMENT,
  type CharacterEquipment,
  type CharacterEquipmentEntry,
  type CharacterWealth,
} from '../../character/equipment-inventory'
import type { CharacterSelectionSource } from '../../character/selection-sources'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft'
import { deriveEquipmentBudgetSummary } from '../resolvers/equipment/equipment-budget'
import { deriveEquipmentDraftEntries } from '../resolvers/equipment/derive-equipment-draft-entries'
import {
  nestedStartingEquipmentChoiceSetId,
  readSelectedStartingEquipmentOptionId,
} from '../resolvers/equipment/resolve-starting-equipment-choice-sets'

// ---------------------------------------------------------------------------
// Character Builder starting-equipment finalization — orchestrates draft
// selections, catalog resolution, and character inventory rows with sources.
// ---------------------------------------------------------------------------

export type ResolvedStartingEquipmentGrantedItem = {
  kind: 'grant'
  grant: GrantedEquipmentItem
  equipmentId: string
  equipment: Equipment | undefined
}

export type ResolvedStartingEquipmentItemChoice = {
  kind: 'choice'
  grant: EquipmentChoiceGrant
  choiceSetId: string
  selectedEquipmentId: string | undefined
  equipment: Equipment | undefined
}

export type ResolvedStartingEquipmentItem =
  | ResolvedStartingEquipmentGrantedItem
  | ResolvedStartingEquipmentItemChoice

/** Resolved starting-equipment option with catalog lookups for finalize and BENCH-095. */
export type ResolvedStartingEquipmentOption = {
  option: StartingEquipmentOption
  items: ResolvedStartingEquipmentItem[]
  wealth: CharacterWealthGrant | undefined
}

function classStartingEquipmentSource(
  classId: string,
  optionId: string,
): CharacterSelectionSource[] {
  return [{ kind: 'classStartingEquipment', sourceId: classId, grantId: optionId }]
}

function resolveGrantedItem(
  grant: GrantedEquipmentItem,
  rulesetId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): ResolvedStartingEquipmentGrantedItem {
  const equipmentId = toEquipmentContentId(rulesetId, grant.equipmentSlug)
  return {
    kind: 'grant',
    grant,
    equipmentId,
    equipment: catalogIndex.equipment.get(equipmentId),
  }
}

function resolveItemChoice(
  grant: EquipmentChoiceGrant,
  classId: string,
  optionId: string,
  itemIndex: number,
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): ResolvedStartingEquipmentItemChoice {
  const choiceSetId = nestedStartingEquipmentChoiceSetId(classId, optionId, itemIndex)
  const selectedEquipmentId = draft.choiceSelections[choiceSetId]?.[0]
  return {
    kind: 'choice',
    grant,
    choiceSetId,
    selectedEquipmentId,
    equipment: selectedEquipmentId ? catalogIndex.equipment.get(selectedEquipmentId) : undefined,
  }
}

/** Resolves a starting-equipment option with catalog lookups for the selected package. */
export function resolveStartingEquipmentOption(
  characterClass: CharacterClass,
  option: StartingEquipmentOption,
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): ResolvedStartingEquipmentOption {
  const rulesetId = characterClass.rulesetId

  return {
    option,
    wealth: option.wealth,
    items: option.items.map((item, itemIndex) =>
      item.kind === 'grant'
        ? resolveGrantedItem(item, rulesetId, catalogIndex)
        : resolveItemChoice(item, characterClass.id, option.id, itemIndex, draft, catalogIndex),
    ),
  }
}

function equipmentEntryFromGrant(
  equipmentId: string,
  grant: GrantedEquipmentItem,
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

function appendResolvedItem(
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

  if (!item.selectedEquipmentId || !item.equipment) return inventory

  return appendEquipmentEntry(inventory, item.equipment, {
    equipmentId: item.selectedEquipmentId,
    quantity: 1,
    sources,
  })
}

/** Assembles finalized equipment and wealth from draft equipment decisions. */
export function assembleStartingEquipment(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): { equipment: CharacterEquipment; wealth: CharacterWealth } {
  if (draft.equipment) {
    const budget = deriveEquipmentBudgetSummary(draft, catalogIndex)
    return {
      equipment: deriveEquipmentDraftEntries(draft, catalogIndex),
      wealth: budget?.remaining ?? characterWealthFromGrant(undefined),
    }
  }

  const classId = draft.class.classId
  if (!classId) {
    return { equipment: EMPTY_CHARACTER_EQUIPMENT, wealth: characterWealthFromGrant(undefined) }
  }

  const characterClass = catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  if (!startingEquipment) {
    return { equipment: EMPTY_CHARACTER_EQUIPMENT, wealth: characterWealthFromGrant(undefined) }
  }

  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!selectedOptionId) {
    return { equipment: EMPTY_CHARACTER_EQUIPMENT, wealth: characterWealthFromGrant(undefined) }
  }

  const option = startingEquipment.options.find((entry) => entry.id === selectedOptionId)
  if (!option) {
    return { equipment: EMPTY_CHARACTER_EQUIPMENT, wealth: characterWealthFromGrant(undefined) }
  }

  const resolved = resolveStartingEquipmentOption(characterClass!, option, draft, catalogIndex)
  const sources = classStartingEquipmentSource(classId, selectedOptionId)

  const equipment = resolved.items.reduce(
    (inventory, item) => appendResolvedItem(inventory, item, sources),
    EMPTY_CHARACTER_EQUIPMENT,
  )

  return {
    equipment,
    wealth: characterWealthFromGrant(resolved.wealth),
  }
}
