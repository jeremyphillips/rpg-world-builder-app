export {
  useVocabularySet,
  useVocabularyMutations,
  vocabularySetQueryKey,
} from './hooks/use-vocabulary-set'
export { useVocabularySets } from './hooks/use-vocabulary-sets'
export { useVocabularyEntryUsage } from './hooks/use-vocabulary-entry-usage'
export { useCreatureTypeVocabulary } from './hooks/use-creature-type-vocabulary'
export { useDamageTypeVocabulary } from './hooks/use-damage-type-vocabulary'
export { useSenseVocabulary } from './hooks/use-sense-vocabulary'
export { useLanguageVocabulary } from './hooks/use-language-vocabulary'
export { useSpellSchoolVocabulary } from './hooks/use-spell-school-vocabulary'
export { useEditionPresetVocabulary } from './hooks/use-edition-preset-vocabulary'
export { useAttackResolutionModeVocabulary } from './hooks/use-attack-resolution-mode-vocabulary'

export * from './sets'
export * from './fields'

export {
  VOCABULARY_SOURCE_BADGE,
  VOCABULARY_SOURCE_LABELS,
  VOCABULARY_STATUS_LABELS,
  UNKNOWN_VOCABULARY_SET_MESSAGE,
  getVocabularySourceLabel,
  getVocabularyStatusLabel,
} from './lib/labels'
export { VOCABULARY_USAGE_REFERENCE_DISCLOSURE_LIMIT } from './lib/usage-references.constants'

export type { VocabularyEntryFormValues } from './lib/vocabulary-entry-form-fields'
export {
  buildVocabularyEntrySheetFields,
  vocabularyEntrySheetFormSchema,
  vocabularyAvailableFromStatus,
  type VocabularyEntrySheetFormValues,
} from './lib/vocabulary-entry-form-fields'
export {
  getVocabularyEntryFormDefinition,
  type VocabularyEntryFormDefinition,
} from './lib/vocabulary-entry-form-registry'
export {
  buildVocabularyEntrySheetDefaultValues,
  requireVocabularyEntryFormDefinition,
  resolveVocabularyEntrySheetHeadline,
  submitVocabularyEntrySheet,
} from './lib/vocabulary-entry-sheet.lib'

export {
  fetchVocabularyDeleteAvailability,
  fetchVocabularyDisableAvailability,
  updateVocabularyEntry,
} from './api/vocabulary-api'
