import { SPELL_SCHOOL_SET_ID, type ResolvedVocabularyOptionSet } from '@rpg/contracts'

import {
  buildActiveVocabularyFieldOptions,
  buildLabelDescriptionActiveVocabulary,
  buildVocabularyFromSeedSet,
  getVocabularyLabel,
  type LabelDescriptionActiveVocabulary,
} from '../build-vocabulary-maps'

export type SpellSchoolVocabulary = LabelDescriptionActiveVocabulary

/** Build label/description/active-id maps from a resolved spell-schools set. */
export function buildSpellSchoolVocabulary(
  set: Pick<ResolvedVocabularyOptionSet, 'options'>,
): SpellSchoolVocabulary {
  return buildLabelDescriptionActiveVocabulary(set)
}

/** Default ruleset seed vocabulary for flows without a campaign id. */
export function buildSeedSpellSchoolVocabulary(): SpellSchoolVocabulary {
  return buildVocabularyFromSeedSet(SPELL_SCHOOL_SET_ID, buildSpellSchoolVocabulary)
}

export const buildActiveSpellSchoolFieldOptions = buildActiveVocabularyFieldOptions

export const getSpellSchoolLabelFromVocabulary = getVocabularyLabel

export function getSpellSchoolDescriptionFromVocabulary(
  vocabulary: SpellSchoolVocabulary | undefined,
  id: string,
): string | undefined {
  const description = vocabulary?.descriptionById[id]
  return description && description.length > 0 ? description : undefined
}
