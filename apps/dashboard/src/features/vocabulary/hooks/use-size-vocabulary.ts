import { CREATURE_SIZE_SET_ID } from '@rpg/contracts'

import { useVocabularySetMaps } from './use-vocabulary-set-maps'

/** Campaign-resolved creature size labels and active ids for forms and tables. */
export function useSizeVocabulary(campaignId: string | undefined) {
  return useVocabularySetMaps(campaignId, CREATURE_SIZE_SET_ID)
}
