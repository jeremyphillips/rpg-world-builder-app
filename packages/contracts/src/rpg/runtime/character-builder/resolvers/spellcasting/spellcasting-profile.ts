import type { CharacterClass } from '../../../../content/classes/class'
import { isSpellcastingActiveAtLevel } from '../../../../content/classes/spellcasting'
import type { Ability } from '../../../../vocab/ability'
import {
  findChoiceProgressionByDestination,
  resolveCantripsKnownFromProfile,
  resolveMaxSelectableSpellLevelFromProfile,
  resolveSpellcastingProfileForClass,
  resolveSpellsAvailableFromProfile,
} from '../../../../campaign/rules/spellcasting-progression'
import { buildChoiceSetId } from '../../choice-set'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'

// ---------------------------------------------------------------------------
// Spellcasting profile — structural facts for the Spells step and choice sources.
// DC/attack/slots stay in CharacterBuildPreview.spellcasting (deriveSpellcastingStats).
// ---------------------------------------------------------------------------

export type BuilderSpellcastingProfile = {
  classId: string
  className: string
  ability: Ability
  /** True when the profile includes a prepared loadout capacity progression. */
  usesPreparedLoadout: boolean
  /** 0 → no cantrip ChoiceSet (paladin, ranger). */
  cantripsKnown: number
  spellsAvailable: number
  /** Highest spell level selectable at the current class level (from slot progression). */
  maxSelectableSpellLevel: number
  choiceSetIds: { cantrips?: string; spells?: string }
}

function buildProfile(
  characterClass: CharacterClass,
  classLevel: number,
  context: CharacterBuildContext,
): BuilderSpellcastingProfile {
  const spellcasting = characterClass.spellcasting!
  const bundle = resolveSpellcastingProfileForClass(
    characterClass,
    context.spellcastingProgression,
  )!

  const cantripsKnown = resolveCantripsKnownFromProfile(bundle.profile, classLevel)
  const spellsAvailable = resolveSpellsAvailableFromProfile(bundle.profile, classLevel)
  const usesPreparedLoadout = Boolean(
    findChoiceProgressionByDestination(bundle.profile, 'prepared', 'capacity'),
  )

  const choiceSetIds: BuilderSpellcastingProfile['choiceSetIds'] = {}
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
    usesPreparedLoadout,
    cantripsKnown,
    spellsAvailable,
    maxSelectableSpellLevel: resolveMaxSelectableSpellLevelFromProfile(bundle, classLevel),
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
): BuilderSpellcastingProfile | null {
  const classId = draft.class.classId
  if (!classId) return null

  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass?.spellcasting) return null

  const classLevel = draft.class.level
  if (!isSpellcastingActiveAtLevel(characterClass.spellcasting, classLevel)) return null

  if (!resolveSpellcastingProfileForClass(characterClass, context.spellcastingProgression)) {
    return null
  }

  return buildProfile(characterClass, classLevel, context)
}
