import {
  toEquipmentContentId,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type ChoiceSet,
  type Equipment,
  type ResolvedEquipmentOption,
  type StartingPackageConversionItem,
} from '@rpg/contracts'

import { selectionBlocker, type SelectionRowPresentation } from '../selection-row-status'
import {
  deriveEquipmentRecommendationIndex,
  type EquipmentRecommendationIndex,
} from './equipment-picker-recommendation-context.lib'
import { resolveEquipmentSelectionRowPresentation } from './equipment-selection-row-presentation.lib'
import type { EquipmentInventoryRow } from './equipment-step.lib'

/** One draft's whole-catalog equipment facts, shared by the picker and every owned surface. */
export type EquipmentSelectionFacts = {
  resolvedById: EquipmentRecommendationIndex
  /** Resolves slug-form equipment ids to content ids. */
  rulesetId?: string
}

export const EMPTY_EQUIPMENT_SELECTION_FACTS: EquipmentSelectionFacts = {
  resolvedById: new Map(),
}

/** Standalone derivation for surfaces evaluated against a draft other than the step draft. */
export function deriveEquipmentSelectionFacts(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  choiceSets: readonly ChoiceSet[]
  rulesetId?: string
}): EquipmentSelectionFacts {
  const classId = args.draft.class.classId
  const characterClass = classId ? args.catalogIndex.classes.get(classId) : undefined
  if (!characterClass) return { ...EMPTY_EQUIPMENT_SELECTION_FACTS, rulesetId: args.rulesetId }

  const { recommendations } = deriveEquipmentRecommendationIndex({
    draft: args.draft,
    characterClass,
    catalogIndex: args.catalogIndex,
    choiceSets: args.choiceSets,
  })
  return { resolvedById: recommendations, rulesetId: args.rulesetId }
}

/** Resolved facts for an equipment id, tolerating slug-form ids. */
export function lookupResolvedEquipment(
  facts: EquipmentSelectionFacts,
  equipmentId: string,
): ResolvedEquipmentOption | undefined {
  const direct = facts.resolvedById.get(equipmentId)
  if (direct) return direct.resolved
  if (!facts.rulesetId) return undefined
  return facts.resolvedById.get(toEquipmentContentId(facts.rulesetId, equipmentId))?.resolved
}

/** Held-equipment presentation: facts only, no acquisition input. */
export function resolveHeldEquipmentSelectionPresentation(
  facts: EquipmentSelectionFacts,
  equipment: Equipment,
): SelectionRowPresentation {
  return resolveEquipmentSelectionRowPresentation({
    equipment,
    resolved: lookupResolvedEquipment(facts, equipment.id),
  })
}

export function withEquipmentSelectionPresentation(
  rows: readonly EquipmentInventoryRow[],
  facts: EquipmentSelectionFacts,
): EquipmentInventoryRow[] {
  return rows.map((row) =>
    row.equipment
      ? {
          ...row,
          selectionPresentation: resolveHeldEquipmentSelectionPresentation(facts, row.equipment),
        }
      : row,
  )
}

/** Package item offered for gold conversion; a blocked conversion is an availability blocker. */
export function resolveEquipmentConversionItemPresentation(args: {
  item: StartingPackageConversionItem
  equipment?: Equipment
  facts: EquipmentSelectionFacts
}): SelectionRowPresentation {
  const blockers = args.item.blockingIssue
    ? [selectionBlocker('conversion_blocked', args.item.blockingIssue)]
    : []
  if (!args.equipment) return { status: blockers, guidance: [] }
  return resolveEquipmentSelectionRowPresentation({
    equipment: args.equipment,
    resolved: lookupResolvedEquipment(args.facts, args.equipment.id),
    blockers,
  })
}
