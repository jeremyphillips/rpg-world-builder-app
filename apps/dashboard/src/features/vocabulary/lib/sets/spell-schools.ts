import { SPELL_SCHOOL_SET_ID, type ResolvedVocabularyOptionSet } from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

import {
  buildLabelDescriptionActiveVocabulary,
  buildVocabularyFromSeedSet,
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

export function buildActiveSpellSchoolFieldOptions(
  vocabulary: SpellSchoolVocabulary | undefined,
): FieldOption[] {
  if (!vocabulary) return []
  return toOptions([...vocabulary.activeIds].sort(), vocabulary.labelById)
}

export function getSpellSchoolLabelFromVocabulary(
  vocabulary: SpellSchoolVocabulary | undefined,
  id: string,
): string {
  return vocabulary?.labelById[id] ?? id
}

export function getSpellSchoolDescriptionFromVocabulary(
  vocabulary: SpellSchoolVocabulary | undefined,
  id: string,
): string | undefined {
  const description = vocabulary?.descriptionById[id]
  return description && description.length > 0 ? description : undefined
}
