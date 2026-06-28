import {
  EDITION_PRESET_ENTRIES,
  EDITION_PRESET_SET_ID,
  getEditionPresetEntry,
  sortEditionPresetIds,
  type ResolvedVocabularyOptionSet,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import {
  buildLabelDescriptionActiveVocabulary,
  buildVocabularyFromSeedSet,
  type LabelDescriptionActiveVocabulary,
} from '../build-vocabulary-maps'

export type EditionPresetVocabulary = LabelDescriptionActiveVocabulary

/** Build label/description/active-id maps from a resolved edition-presets set. */
export function buildEditionPresetVocabulary(
  set: Pick<ResolvedVocabularyOptionSet, 'options'>,
): EditionPresetVocabulary {
  return buildLabelDescriptionActiveVocabulary(set)
}

/** Default ruleset seed vocabulary for flows without a campaign id. */
export function buildSeedEditionPresetVocabulary(): EditionPresetVocabulary {
  return buildVocabularyFromSeedSet(EDITION_PRESET_SET_ID, buildEditionPresetVocabulary)
}

export function buildEditionPresetFieldOptions(
  vocabulary: EditionPresetVocabulary | undefined,
): FieldOption[] {
  if (!vocabulary) return []

  return sortEditionPresetIds(vocabulary.activeIds).map((id) => {
    const reference =
      getEditionPresetEntry(id) ?? EDITION_PRESET_ENTRIES[id as keyof typeof EDITION_PRESET_ENTRIES]
    return {
      value: id,
      label: vocabulary.labelById[id] ?? reference?.label ?? id,
      description: vocabulary.descriptionById[id] || reference?.description,
      meta: reference?.meta ? [...reference.meta] : undefined,
    }
  })
}
