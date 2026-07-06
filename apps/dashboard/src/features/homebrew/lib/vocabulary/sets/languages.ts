import {
  DEFAULT_SYSTEM_RULESET_ID,
  getLanguageCategoryLabel,
  LANGUAGE_SET_ID,
  type LanguageCategory,
  type ResolvedVocabularyOptionSet,
  type SystemRulesetId,
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
  rulesetId: SystemRulesetId = DEFAULT_SYSTEM_RULESET_ID,
): LanguageVocabulary {
  const base = buildLabelActiveVocabulary(set)
  const categoryById = Object.fromEntries(
    set.options.map((option) => [option.id, getSeedLanguageCategory(rulesetId, option.id)]),
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

/** Category chips derived from active campaign language vocabulary — not a static enum list. */
export function buildActiveLanguageCategoryFieldOptions(
  vocabulary: LanguageVocabulary | undefined,
): FieldOption[] {
  if (!vocabulary) return []

  const categories = new Set<string>()
  for (const id of vocabulary.activeIds) {
    const category = vocabulary.categoryById[id]
    if (category) categories.add(category)
  }

  const sorted = [...categories].sort()
  return toOptions(
    sorted,
    Object.fromEntries(sorted.map((category) => [category, getLanguageCategoryLabel(category)])),
  )
}

export function getLanguageLabelFromVocabulary(
  vocabulary: LanguageVocabulary | undefined,
  id: string,
): string {
  return vocabulary?.labelById[id] ?? id
}
