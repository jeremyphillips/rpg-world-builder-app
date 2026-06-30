import { LANGUAGE_SET_ID } from '@rpg/contracts'

import { buildLanguageVocabulary } from '../lib/vocabulary/sets/languages'
import { useVocabularySet } from './use-vocabulary-set'

/** Campaign-resolved language labels and active ids for forms and tables. */
export function useLanguageVocabulary(campaignId: string | undefined) {
  const query = useVocabularySet(campaignId, LANGUAGE_SET_ID)

  return {
    ...query,
    vocabulary: query.data ? buildLanguageVocabulary(query.data) : undefined,
  }
}
