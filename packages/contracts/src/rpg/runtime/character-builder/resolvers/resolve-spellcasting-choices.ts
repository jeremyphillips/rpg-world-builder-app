import type { ChoiceSourceResolver } from './choice-source-resolver'
import { resolveSpellcastingChoiceSets } from './resolve-spellcasting-choice-sets'
import { resolveSpellcastingProfile } from './spellcasting-profile'

/** Exposes class spellcasting choices as builder ChoiceSets. */
export const resolveSpellcastingChoices: ChoiceSourceResolver = (draft, context, catalogIndex) => {
  const profile = resolveSpellcastingProfile(draft, context)
  if (!profile) return []

  const characterClass = catalogIndex.classes.get(profile.classId)
  if (!characterClass) return []

  return resolveSpellcastingChoiceSets(profile, characterClass.slug, catalogIndex)
}
