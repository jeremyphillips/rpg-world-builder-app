import type { CharacterClass } from '../../../../content/classes/class'
import type { Spellcasting } from '../../../../content/classes/spellcasting'
import { isSpellcastingActiveAtLevel } from '../../../../content/classes/spellcasting/class-spellcasting-ownership'
import { resolveClassCantripCount } from '../../../creature/spellcasting'
import type { Ability } from '../../../../vocab/ability'
import { CLASS_SPELLCASTING_CHOICE_SUFFIXES } from '../../../../content/classes/spellcasting'
import {
  findCompiledChoiceProgressionBySuffix,
  resolveClassSpellcasting,
  resolveMaxSelectableSpellLevelFromClass,
  resolveSpellsAvailableFromClass,
  type ResolvedClassSpellcasting,
} from '../../../creature/resolve-class-spellcasting'
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
  resolved: ResolvedClassSpellcasting
  /** True when the class includes a prepared loadout capacity progression. */
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
  const resolved = resolveClassSpellcasting(characterClass, context.spellcastingProgression)!

  const cantripsKnown = resolveClassCantripCount({
    source: characterClass,
    classLevel,
    runtime: true,
  })
  const spellsAvailable = resolveSpellsAvailableFromClass(resolved, classLevel)
  const usesPreparedLoadout = Boolean(
    findCompiledChoiceProgressionBySuffix(
      resolved,
      CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared,
      'capacity',
    ),
  )

  return {
    classId: characterClass.id,
    className: characterClass.name,
    ability: spellcasting.ability,
    classLevel,
    spellcasting,
    resolved,
    usesPreparedLoadout,
    cantripsKnown,
    spellsAvailable,
    maxSelectableSpellLevel: resolveMaxSelectableSpellLevelFromClass(resolved, classLevel),
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
  if (!isSpellcastingActiveAtLevel(characterClass, classLevel, { runtime: true })) return null

  if (!resolveClassSpellcasting(characterClass, context.spellcastingProgression)) {
    return null
  }

  return buildProfile(characterClass, classLevel, context)
}
