import { isSpellcastingActiveAtLevel } from '../../../../content/classes/spellcasting'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import { resolveSpellcastingProfile, type SpellcastingProfile } from './spellcasting-profile'

export type SpellStepNotApplicableReason = 'noSpellcasting' | 'inactiveAtLevel'

export type SpellStepApplicability =
  | { kind: 'blocked' }
  | {
      kind: 'notApplicable'
      reason: SpellStepNotApplicableReason
      className: string
      level: number
    }
  | { kind: 'applicable'; profile: SpellcastingProfile }

/**
 * Distinguishes spells-step blocked (no class), not applicable (non-caster or
 * inactive spellcasting), and applicable caster states before choice resolution.
 */
export function resolveSpellStepApplicability(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): SpellStepApplicability {
  const classId = draft.class.classId
  if (!classId) return { kind: 'blocked' }

  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass) return { kind: 'blocked' }

  const className = characterClass.name
  const level = draft.class.level

  if (!characterClass.spellcasting) {
    return { kind: 'notApplicable', reason: 'noSpellcasting', className, level }
  }

  if (!isSpellcastingActiveAtLevel(characterClass.spellcasting, level)) {
    return { kind: 'notApplicable', reason: 'inactiveAtLevel', className, level }
  }

  const profile = resolveSpellcastingProfile(draft, context)
  if (!profile) {
    return { kind: 'notApplicable', reason: 'inactiveAtLevel', className, level }
  }

  return { kind: 'applicable', profile }
}
