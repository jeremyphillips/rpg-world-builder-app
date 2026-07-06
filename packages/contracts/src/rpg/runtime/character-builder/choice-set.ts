// ---------------------------------------------------------------------------
// ChoiceSet — the builder's pending-choice model.
//
// ChoiceSets are derived at runtime by resolveAvailableChoices (BENCH-087);
// they are never persisted. Player selections live in
// CharacterBuilderDraft.choiceSelections, keyed by the deterministic
// ChoiceSet id.
// ---------------------------------------------------------------------------

export const CHOICE_SOURCE_TYPES = [
  'species',
  'heritage',
  'class',
  'ruleset',
  'spellcasting',
] as const

export type ChoiceSourceType = (typeof CHOICE_SOURCE_TYPES)[number]

/**
 * The kind of content a player is selecting in a ChoiceSet.
 * Used to route ChoiceSets to the correct wizard step and renderer.
 */
export const CHOICE_TYPES = [
  'skillProficiency',
  'weaponProficiency',
  'toolProficiency',
  'armorTraining',
  'language',
  'trait',
  'feat',
  'equipment',
  'cantrip',
  'spell',
] as const

export type ChoiceType = (typeof CHOICE_TYPES)[number]

/** A single selectable option in a ChoiceSet, carrying display metadata resolved from catalog. */
export type ChoiceSetOption = {
  id: string
  label: string
  description?: string
}

/**
 * A pending choice the builder UI must collect from the player.
 *
 * IDs are deterministic — keyed by source so the same ChoiceSet is stable
 * across re-derives. Examples:
 *   - `class:srd-cc-5.2.1:wizard:skills`
 *   - `species:srd-cc-5.2.1:elf:heritage`
 *   - `class:srd-cc-5.2.1:fighter:starting-equipment`
 *   - `ruleset:srd-cc-5.2.1:origin-languages`
 *   - `spellcasting:srd-cc-5.2.1:wizard:spells`
 *
 * Options carry display metadata resolved from the catalog.
 * `selectedIds` stays in the draft (CharacterBuilderDraft.choiceSelections),
 * not on the ChoiceSet — ChoiceSets are re-derived on every render.
 */
export type ChoiceSet = {
  /** Deterministic id — use {@link buildChoiceSetId} to construct. */
  id: string
  /** Category of the granting entity. */
  sourceType: ChoiceSourceType
  /** Content id of the granting entity (e.g. `srd-cc-5.2.1:wizard`). */
  sourceId: string
  /** What is being chosen. Routes the ChoiceSet to the correct step and renderer. */
  choiceType: ChoiceType
  /** Human-readable label for the choice group (e.g. "Choose Skills"). */
  label: string
  /** Minimum number of selections required to satisfy this ChoiceSet. */
  min: number
  /** Maximum number of selections allowed. */
  max: number
  /** Resolved options the player may select from. */
  options: ChoiceSetOption[]
  /**
   * When true, this ChoiceSet must reach `min` before stepSubmit validation
   * passes. When false, the choice is optional / advisory.
   */
  required: boolean
}

// ---------------------------------------------------------------------------
// Deterministic id construction
//
// Format: `{sourceType}:{sourceId}:{slot}`
// The `slot` identifies the sub-choice within the source (e.g. `skills`,
// `heritage`, `starting-equipment`, `cantrips`, `spells`).
// ---------------------------------------------------------------------------

/**
 * Builds a deterministic ChoiceSet id from its components.
 *
 * @param sourceType - Category of the granting entity.
 * @param sourceId   - Content id of the granting entity (e.g. `srd-cc-5.2.1:wizard`).
 * @param slot       - Sub-choice slot within the source (e.g. `skills`, `heritage`).
 */
export function buildChoiceSetId(
  sourceType: ChoiceSourceType,
  sourceId: string,
  slot: string,
): string {
  return `${sourceType}:${sourceId}:${slot}`
}

// ---------------------------------------------------------------------------
// Satisfaction helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the selections for this ChoiceSet meet its `min`
 * constraint.
 */
export function isChoiceSetSatisfied(choiceSet: ChoiceSet, selections: readonly string[]): boolean {
  return selections.length >= choiceSet.min
}

/**
 * Returns true when every `required` ChoiceSet in the list is satisfied by
 * the given selection map (keyed by ChoiceSet id).
 */
export function areRequiredChoiceSetsSatisfied(
  choiceSets: readonly ChoiceSet[],
  selectionMap: Readonly<Record<string, string[] | readonly string[]>>,
): boolean {
  return choiceSets.every(
    (cs) => !cs.required || isChoiceSetSatisfied(cs, selectionMap[cs.id] ?? []),
  )
}
