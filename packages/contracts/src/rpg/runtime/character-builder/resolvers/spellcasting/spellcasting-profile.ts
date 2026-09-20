import type { CharacterClass } from '../../../../content/classes/class'
import {
  isSpellcastingActiveAtLevel,
  type Spellcasting,
} from '../../../../content/classes/spellcasting'
import { resolveClassCantripCount } from '../../../creature/spellcasting'
import type { Ability } from '../../../../vocab/ability'
import {
  findChoiceProgressionByDestination,
  resolveMaxSelectableSpellLevelFromProfile,
  resolveSpellcastingProfileForClass,
  resolveSpellsAvailableFromProfile,
  type ResolvedSpellcastingProfileBundle,
} from '../../../../campaign/rules/spellcasting-progression'
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
  classLevel: number
  spellcasting: Spellcasting
  profileBundle: ResolvedSpellcastingProfileBundle
  /** True when the profile includes a prepared loadout capacity progression. */
  usesPreparedLoadout: boolean
  /** 0 → no cantrip ChoiceSet (paladin, ranger). */
  cantripsKnown: number
  spellsAvailable: number
  /** Highest spell level selectable at the current class level (from slot progression). */
  maxSelectableSpellLevel: number
}

function buildProfile(
  characterClass: CharacterClass,
  classLevel: number,
  context: CharacterBuildContext,
): BuilderSpellcastingProfile {
  const spellcasting = characterClass.spellcasting!
  const profileBundle = resolveSpellcastingProfileForClass(
    characterClass,
    context.spellcastingProgression,
  )!

  const cantripsKnown = resolveClassCantripCount({ spellcasting, classLevel })
  const spellsAvailable = resolveSpellsAvailableFromProfile(profileBundle.profile, classLevel)
  const usesPreparedLoadout = Boolean(
    findChoiceProgressionByDestination(profileBundle.profile, 'prepared', 'capacity'),
  )

  return {
    classId: characterClass.id,
    className: characterClass.name,
    ability: spellcasting.ability,
    classLevel,
    spellcasting,
    profileBundle,
    usesPreparedLoadout,
    cantripsKnown,
    spellsAvailable,
    maxSelectableSpellLevel: resolveMaxSelectableSpellLevelFromProfile(profileBundle, classLevel),
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
