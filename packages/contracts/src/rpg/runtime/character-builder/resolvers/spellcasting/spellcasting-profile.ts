import type { CharacterClass } from '../../../../content/classes/class'
import {
  isSpellcastingActiveAtLevel,
  type SpellPreparationMode,
} from '../../../../content/classes/spellcasting'
import type { Ability } from '../../../../vocab/ability'
import {
  cantripsKnownAtLevel,
  maxSelectableSpellLevel,
  spellsAvailableAtLevel,
} from '../../../creature/spellcasting'
import { buildChoiceSetId } from '../../choice-set'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'

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
