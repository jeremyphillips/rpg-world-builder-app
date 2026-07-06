import type { CharacterBuildCatalogIndex } from '../context'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuilderDraft } from '../draft'
import type { ChoiceSourceResolver } from './choice-source-resolver'
import { buildSpellcastingChoiceSets } from './spellcasting-resolution'
import { resolveSpellcastingProfile } from './spellcasting-profile'

export function resolveSpellcastingChoices(
  draft: CharacterBuilderDraft,
  context: Parameters<ChoiceSourceResolver>[1],
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet[] {
  const profile = resolveSpellcastingProfile(draft, context)
  if (!profile) return []

  const characterClass = catalogIndex.classes.get(profile.classId)
  if (!characterClass) return []

  return buildSpellcastingChoiceSets(profile, characterClass.slug, catalogIndex)
}
