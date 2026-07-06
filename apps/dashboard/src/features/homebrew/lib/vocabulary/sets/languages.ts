import {
  DEFAULT_SYSTEM_RULESET_ID,
  LANGUAGE_CATEGORIES,
  LANGUAGE_CATEGORY_ENTRIES,
  LANGUAGE_SET_ID,
  type LanguageCategory,
  type ResolvedVocabularyOptionSet,
} from '@rpg/contracts'
import { getSeedLanguageCategory } from '@rpg/catalog/vocabulary'
import { toOptions, type FieldOption } from '@rpg/ui/form'

import { buildLabelActiveVocabulary, buildVocabularyFromSeedSet } from '../build-vocabulary-maps'

export type LanguageVocabulary = {
  labelById: Record<string, string>
  activeIds: ReadonlySet<string>
  categoryById: Record<string, LanguageCategory | undefined>
}

/** Build label/active-id maps from a resolved languages set. */
export function buildLanguageVocabulary(
  set: Pick<ResolvedVocabularyOptionSet, 'options'>,
): LanguageVocabulary {
  const base = buildLabelActiveVocabulary(set)
  const categoryById = Object.fromEntries(
    set.options.map((option) => [
      option.id,
      getSeedLanguageCategory(DEFAULT_SYSTEM_RULESET_ID, option.id),
    ]),
  )
  return { ...base, categoryById }
}

/** Default ruleset seed vocabulary for flows without a campaign id. */
export function buildSeedLanguageVocabulary(): LanguageVocabulary {
  return buildVocabularyFromSeedSet(LANGUAGE_SET_ID, buildLanguageVocabulary)
}

export function buildActiveLanguageFieldOptions(
  vocabulary: LanguageVocabulary | undefined,
): FieldOption[] {
  if (!vocabulary) return []
  return toOptions([...vocabulary.activeIds].sort(), vocabulary.labelById)
}

/** Static language category options for grant/choice authoring fields. */
export function buildLanguageCategoryFieldOptions(): FieldOption[] {
  return toOptions(
    LANGUAGE_CATEGORIES,
    Object.fromEntries(
      LANGUAGE_CATEGORIES.map((category) => [category, LANGUAGE_CATEGORY_ENTRIES[category].label]),
    ) as Record<(typeof LANGUAGE_CATEGORIES)[number], string>,
  )
}

export function getLanguageLabelFromVocabulary(
  vocabulary: LanguageVocabulary | undefined,
  id: string,
): string {
  return vocabulary?.labelById[id] ?? id
}
