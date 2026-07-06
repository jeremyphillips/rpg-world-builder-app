import type { CharacterClass } from '../../../content/classes/class'
import {
  isSpellcastingActiveAtLevel,
  type Spellcasting,
  type SpellPreparationMode,
} from '../../../content/classes/spellcasting'
import { getSlotRow, SLOT_TABLES } from '../../../content/spell-slots'
import type { Ability } from '../../../vocab/ability'
import { buildChoiceSetId } from '../choice-set'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft'

// ---------------------------------------------------------------------------
// Spellcasting profile — structural facts for the Spells step and choice sources.
// DC/attack/slots stay in CharacterBuildPreview.spellcasting (deriveSpellcastingStats).
// ---------------------------------------------------------------------------

export type SpellcastingProfile = {
  classId: string
  className: string
  ability: Ability
  preparation: SpellPreparationMode
  /** 0 → no cantrip ChoiceSet (paladin, ranger). */
  cantripsKnown: number
  spellsAvailable: number
  /** Highest spell level selectable at the current class level (from slot progression). */
  maxSelectableSpellLevel: number
  choiceSetIds: { cantrips?: string; spells?: string }
}

function progressionValueAtLevel<T extends { level: number }>(
  entries: readonly T[] | undefined,
  classLevel: number,
  getValue: (entry: T) => number,
): number {
  if (!entries?.length) return 0

  return entries
    .filter((entry) => entry.level <= classLevel)
    .reduce((best, entry) => Math.max(best, getValue(entry)), 0)
}

export function cantripsKnownAtLevel(spellcasting: Spellcasting, classLevel: number): number {
  return progressionValueAtLevel(spellcasting.cantrips, classLevel, (entry) => entry.known)
}

export function spellsAvailableAtLevel(spellcasting: Spellcasting, classLevel: number): number {
  return progressionValueAtLevel(spellcasting.spellsAvailable, classLevel, (entry) => entry.count)
}

/** Highest spell level with at least one slot at the given character level. */
export function maxSelectableSpellLevel(spellcasting: Spellcasting, classLevel: number): number {
  const row = getSlotRow(SLOT_TABLES[spellcasting.progression], classLevel) ?? []
  let maxLevel = 0

  for (let index = 0; index < row.length; index++) {
    if ((row[index] ?? 0) > 0) {
      maxLevel = index + 1
    }
  }

  return maxLevel
}

function buildProfile(characterClass: CharacterClass, classLevel: number): SpellcastingProfile {
  const spellcasting = characterClass.spellcasting!
  const cantripsKnown = cantripsKnownAtLevel(spellcasting, classLevel)
  const spellsAvailable = spellsAvailableAtLevel(spellcasting, classLevel)

  const choiceSetIds: SpellcastingProfile['choiceSetIds'] = {}
  if (cantripsKnown > 0) {
    choiceSetIds.cantrips = buildChoiceSetId('spellcasting', characterClass.id, 'cantrips')
  }
  if (spellsAvailable > 0) {
    choiceSetIds.spells = buildChoiceSetId('spellcasting', characterClass.id, 'spells')
  }

  return {
    classId: characterClass.id,
    className: characterClass.name,
    ability: spellcasting.ability,
    preparation: spellcasting.preparation,
    cantripsKnown,
    spellsAvailable,
    maxSelectableSpellLevel: maxSelectableSpellLevel(spellcasting, classLevel),
    choiceSetIds,
  }
}

/**
 * Returns spellcasting structural facts for the selected class at the draft level,
 * or null when the class has no spellcasting block or spellcasting is inactive.
 */
export function resolveSpellcastingProfile(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): SpellcastingProfile | null {
  const classId = draft.class.classId
  if (!classId) return null

  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass?.spellcasting) return null

  const classLevel = draft.class.level
  if (!isSpellcastingActiveAtLevel(characterClass.spellcasting, classLevel)) return null

  return buildProfile(characterClass, classLevel)
}
