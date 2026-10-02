import { SENSE_SET_ID } from '@rpg/contracts'

import { useVocabularySetMaps } from './use-vocabulary-set-maps'

/** Campaign-resolved sense labels and active ids for forms and tables. */
export function useSenseVocabulary(campaignId: string | undefined) {
  return useVocabularySetMaps(campaignId, SENSE_SET_ID)
}
