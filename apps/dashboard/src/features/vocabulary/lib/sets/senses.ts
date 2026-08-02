import { SENSE_SET_ID, type ResolvedVocabularyOptionSet } from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

import { buildLabelActiveVocabulary, buildVocabularyFromSeedSet } from '../build-vocabulary-maps'

export type SenseVocabulary = {
  labelById: Record<string, string>
  activeIds: ReadonlySet<string>
}

/** Build label/active-id maps from a resolved senses set. */
export function buildSenseVocabulary(
  set: Pick<ResolvedVocabularyOptionSet, 'options'>,
): SenseVocabulary {
  return buildLabelActiveVocabulary(set)
}

/** Default ruleset seed vocabulary for flows without a campaign id. */
export function buildSeedSenseVocabulary(): SenseVocabulary {
  return buildVocabularyFromSeedSet(SENSE_SET_ID, buildSenseVocabulary)
}

export function buildActiveSenseFieldOptions(
  vocabulary: SenseVocabulary | undefined,
): FieldOption[] {
  if (!vocabulary) return []
  return toOptions([...vocabulary.activeIds].sort(), vocabulary.labelById)
}

export function getSenseLabelFromVocabulary(
  vocabulary: SenseVocabulary | undefined,
  id: string,
): string {
  return vocabulary?.labelById[id] ?? id
}
