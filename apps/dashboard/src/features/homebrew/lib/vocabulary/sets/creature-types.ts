import { CREATURE_TYPE_SET_ID, type ResolvedVocabularyOptionSet } from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

import { buildLabelActiveVocabulary, buildVocabularyFromSeedSet } from '../build-vocabulary-maps'

export type CreatureTypeVocabulary = {
  labelById: Record<string, string>
  activeIds: ReadonlySet<string>
}

/** Build label/active-id maps from a resolved creature-types set. */
export function buildCreatureTypeVocabulary(
  set: Pick<ResolvedVocabularyOptionSet, 'options'>,
): CreatureTypeVocabulary {
  return buildLabelActiveVocabulary(set)
}

/** Default ruleset seed vocabulary for flows without a campaign id (e.g. create wizard). */
export function buildSeedCreatureTypeVocabulary(): CreatureTypeVocabulary {
  return buildVocabularyFromSeedSet(CREATURE_TYPE_SET_ID, buildCreatureTypeVocabulary)
}

export function buildActiveCreatureTypeFieldOptions(
  vocabulary: CreatureTypeVocabulary | undefined,
): FieldOption[] {
  if (!vocabulary) return []
  return toOptions([...vocabulary.activeIds].sort(), vocabulary.labelById)
}

export function getCreatureTypeLabel(
  vocabulary: CreatureTypeVocabulary | undefined,
  id: string,
): string {
  return vocabulary?.labelById[id] ?? id
}
