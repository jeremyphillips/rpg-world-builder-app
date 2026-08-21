import type { StartingWealthRules } from '../../../campaign/rules/starting-wealth'
import type { SystemRulesetId } from '../../../primitives/ruleset'
import type { Equipment } from '../../../content/equipment'
import type { EquipmentChoiceGrant } from '../../../content/lib/grants/equipment-grant'
import type { CharacterWealthGrant } from '../../../content/lib/grants/wealth-grant'
import type {
  StartingEquipmentGrantedItem,
  StartingEquipmentOption,
} from '../../../content/starting-equipment'
import {
  isProficiencyLinkedStartingEquipmentGrant,
  startingEquipmentGrantEquipmentSlug,
  startingEquipmentGrantProficiencyChoiceId,
} from '../../../content/starting-equipment'
import type { CharacterClass } from '../../../content/classes/class'
import { toEquipmentContentId } from '../../creature/equipment'
import {
  appendEquipmentEntry,
  characterWealthFromGrant,
  EMPTY_CHARACTER_EQUIPMENT,
  type CharacterEquipment,
  type CharacterEquipmentEntry,
  type CharacterWealth,
} from '../../character/sheet/equipment-inventory'
import type { CharacterSelectionSource } from '../../character/sheet/selection-sources'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { deriveEquipmentBudgetSummary } from '../resolvers/equipment/equipment-budget'
import { deriveEquipmentBudgetSummaryFromFunding } from '../resolvers/equipment/resolve-starting-equipment-funding'
import type { ResolvedStartingEquipmentFunding } from '../resolvers/equipment/resolve-starting-equipment-funding'
import { deriveEquipmentDraftEntries } from '../resolvers/equipment/derive-equipment-draft-entries'
import { resolveProficiencyLinkedEquipmentGrant } from '../resolvers/equipment/resolve-proficiency-linked-equipment-grant'
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
  grant: StartingEquipmentGrantedItem
  equipmentId: string
  equipment: Equipment | undefined
}

export type ResolvedStartingEquipmentProficiencyLinkedGrant = {
  kind: 'proficiency_linked_grant'
  grant: StartingEquipmentGrantedItem
  choiceId: string
  status: 'resolved' | 'pending' | 'invalid'
  equipmentId?: string
  equipment?: Equipment
  issue?: string
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
  | ResolvedStartingEquipmentProficiencyLinkedGrant
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

function resolveEquipmentGrant(
  grant: StartingEquipmentGrantedItem,
  rulesetId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): ResolvedStartingEquipmentGrantedItem {
  const equipmentSlug = startingEquipmentGrantEquipmentSlug(grant)
  if (!equipmentSlug) {
    throw new Error('Expected equipment starting-equipment grant target')
  }

  const equipmentId = toEquipmentContentId(rulesetId, equipmentSlug)
  return {
    kind: 'grant',
    grant,
    equipmentId,
    equipment: catalogIndex.equipment.get(equipmentId),
  }
}

function resolveProficiencyLinkedGrant(
  grant: StartingEquipmentGrantedItem,
  classId: string,
  characterClass: CharacterClass,
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): ResolvedStartingEquipmentProficiencyLinkedGrant {
  const choiceId = startingEquipmentGrantProficiencyChoiceId(grant)!
  const result = resolveProficiencyLinkedEquipmentGrant({
    source: { ownerType: 'class', ownerId: classId, choiceId },
    draft,
    characterClass,
    catalogIndex,
  })

  if (result.status === 'resolved') {
    return {
      kind: 'proficiency_linked_grant',
      grant,
      choiceId,
      status: 'resolved',
      equipmentId: result.equipmentId,
      equipment: result.equipment,
    }
  }

  if (result.status === 'invalid') {
    return {
      kind: 'proficiency_linked_grant',
      grant,
      choiceId,
      status: 'invalid',
      issue: result.issue,
    }
  }

  return {
    kind: 'proficiency_linked_grant',
    grant,
    choiceId,
    status: 'pending',
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
    items: option.items.flatMap((item, itemIndex): ResolvedStartingEquipmentItem[] => {
      if (item.kind === 'grant') {
        if (isProficiencyLinkedStartingEquipmentGrant(item)) {
          return [
            resolveProficiencyLinkedGrant(
              item,
              characterClass.id,
              characterClass,
              draft,
              catalogIndex,
            ),
          ]
        }
        return [resolveEquipmentGrant(item, rulesetId, catalogIndex)]
      }

      return [resolveItemChoice(item, characterClass.id, option.id, itemIndex, draft, catalogIndex)]
    }),
  }
}

function equipmentEntryFromGrant(
  equipmentId: string,
  grant: StartingEquipmentGrantedItem,
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

function emptyStartingEquipmentResult(): {
  equipment: CharacterEquipment
  wealth: CharacterWealth
} {
  return { equipment: EMPTY_CHARACTER_EQUIPMENT, wealth: characterWealthFromGrant(undefined) }
}

function resolveAssemblyRulesetId(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  rulesetId?: SystemRulesetId,
): SystemRulesetId | undefined {
  if (rulesetId) return rulesetId
  const classId = draft.class.classId
  if (!classId) return undefined
  return catalogIndex.classes.get(classId)?.rulesetId
}

function assembleFromDraftEquipment(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: AssembleStartingEquipmentOptions,
): { equipment: CharacterEquipment; wealth: CharacterWealth } {
  const purchases = draft.equipment!.purchases ?? []
  const budget = options?.funding
    ? deriveEquipmentBudgetSummaryFromFunding({
        funding: options.funding,
        purchases,
        catalogIndex,
      })
    : deriveEquipmentBudgetSummary(draft, catalogIndex, {
        startingWealth: options?.startingWealth,
      })

  const rulesetId = resolveAssemblyRulesetId(draft, catalogIndex, options?.rulesetId)

  return {
    equipment: deriveEquipmentDraftEntries(draft, catalogIndex, {
      startingWealth: options?.startingWealth,
      rulesetId,
    }),
    wealth: budget?.remaining ?? characterWealthFromGrant(undefined),
  }
}

function assembleFromSelectedPackage(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): { equipment: CharacterEquipment; wealth: CharacterWealth } {
  const classId = draft.class.classId
  if (!classId) return emptyStartingEquipmentResult()

  const characterClass = catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  if (!characterClass || !startingEquipment) return emptyStartingEquipmentResult()

  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!selectedOptionId) return emptyStartingEquipmentResult()

  const option = startingEquipment.options.find((entry) => entry.id === selectedOptionId)
  if (!option) return emptyStartingEquipmentResult()

  const resolved = resolveStartingEquipmentOption(characterClass, option, draft, catalogIndex)
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

export type AssembleStartingEquipmentOptions = {
  /** Pre-resolved funding snapshot — tier rules are not re-resolved when provided. */
  funding?: ResolvedStartingEquipmentFunding
  /** Campaign starting wealth — required for magic-grant assembly when draft equipment is present. */
  startingWealth?: StartingWealthRules
  /** Canonical ruleset id from build context — prefer threading over catalog inference. */
  rulesetId?: SystemRulesetId
}

/** Assembles finalized equipment and wealth from draft equipment decisions. */
export function assembleStartingEquipment(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: AssembleStartingEquipmentOptions,
): { equipment: CharacterEquipment; wealth: CharacterWealth } {
  if (draft.equipment?.skipped) {
    return emptyStartingEquipmentResult()
  }

  if (draft.equipment) {
    return assembleFromDraftEquipment(draft, catalogIndex, options)
  }

  return assembleFromSelectedPackage(draft, catalogIndex)
}
