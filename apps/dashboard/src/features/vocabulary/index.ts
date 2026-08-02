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
  VOCABULARY_NOT_IMPLEMENTED_MESSAGE,
  VOCABULARY_BULK_ACTIONS_MENU_LABEL,
  VOCABULARY_BULK_ACTION_EDIT_AVAILABILITY_LABEL,
  VOCABULARY_BULK_AVAILABILITY_DIALOG_HEADLINE,
  VOCABULARY_DISABLE_BLOCKED_HEADLINE,
  VOCABULARY_DISABLE_BLOCKED_DESCRIPTION,
  VOCABULARY_DELETE_BLOCKED_HEADLINE,
  VOCABULARY_DELETE_BLOCKED_DESCRIPTION,
  VOCABULARY_BULK_BLOCKED_DIALOG_HEADLINE,
  VOCABULARY_BULK_BLOCKED_DIALOG_DESCRIPTION,
  getVocabularySourceLabel,
  getVocabularyStatusLabel,
  formatBulkVocabularyAvailabilityFullSuccess,
  formatBulkVocabularyAvailabilityPartialSuccess,
} from './lib/labels'
export { VOCABULARY_USAGE_REFERENCE_DISCLOSURE_LIMIT } from './lib/usage-references.constants'

export type { VocabularyEntryFormValues } from './lib/vocabulary-entry-form-fields'
export {
  buildVocabularyEntrySheetFields,
  vocabularyEntrySheetFormSchema,
  type VocabularyEntrySheetFormValues,
} from './lib/vocabulary-entry-form-fields'
export {
  getVocabularyEntryFormDefinition,
  type VocabularyEntryFormDefinition,
} from './lib/vocabulary-entry-form-registry'
export {
  buildVocabularyEntrySheetDefaultValues,
  buildVocabularyEntrySheetFieldItems,
  resolveVocabularyEntrySheetHeadline,
  submitVocabularyEntrySheet,
} from './lib/vocabulary-entry-sheet.lib'

export {
  fetchVocabularyDeleteAvailability,
  fetchVocabularyDisableAvailability,
  updateVocabularyEntry,
} from './api/vocabulary-api'
