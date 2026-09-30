import type { CharacterSelectionSource } from '../../../character/sheet/selection-sources'
import { startingEquipmentChoiceSetId } from '../equipment/resolve-starting-equipment-choice-sets'

export const SELECTION_SOURCE_MECHANICS = [
  'fixed-grant',
  'choice-derived',
  'constraint-outcome',
  'purchase',
] as const

export type SelectionSourceMechanic = (typeof SELECTION_SOURCE_MECHANICS)[number]

/**
 * ChoiceSet id carried by a source, when that id is in the resolved graph.
 * Package items point at the class starting-equipment set, not their option id.
 */
export function resolveSelectionSourceChoiceSetId(
  source: CharacterSelectionSource,
  resolvedChoiceSetIds: ReadonlySet<string>,
): string | undefined {
  if (source.kind === 'classStartingEquipment' && source.sourceId) {
    const choiceSetId = startingEquipmentChoiceSetId(source.sourceId)
    return resolvedChoiceSetIds.has(choiceSetId) ? choiceSetId : undefined
  }

  if (source.grantId && resolvedChoiceSetIds.has(source.grantId)) return source.grantId
  return undefined
}

/** Classifies one selection source. Counts and categories are not inputs. */
export function classifySelectionSourceMechanic(
  source: CharacterSelectionSource,
  resolvedChoiceSetIds: ReadonlySet<string>,
): SelectionSourceMechanic {
  if (source.kind === 'grant' || source.kind === 'manual') return 'constraint-outcome'
  if (source.kind === 'startingGold') return 'purchase'
  if (resolveSelectionSourceChoiceSetId(source, resolvedChoiceSetIds)) return 'choice-derived'
  return 'fixed-grant'
}
