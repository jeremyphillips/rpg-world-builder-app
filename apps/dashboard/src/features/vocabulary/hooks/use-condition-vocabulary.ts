import { CONDITION_SET_ID } from '@rpg/contracts'

import { useVocabularySetMaps } from './use-vocabulary-set-maps'

/** Campaign-resolved effect condition labels and active ids for forms and tables. */
export function useConditionVocabulary(campaignId: string | undefined) {
  return useVocabularySetMaps(campaignId, CONDITION_SET_ID)
}
