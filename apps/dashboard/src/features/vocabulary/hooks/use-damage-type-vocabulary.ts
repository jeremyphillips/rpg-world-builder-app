import { DAMAGE_TYPE_SET_ID } from '@rpg/contracts'

import { useVocabularySetMaps } from './use-vocabulary-set-maps'

/** Campaign-resolved damage type labels and active ids for forms and tables. */
export function useDamageTypeVocabulary(campaignId: string | undefined) {
  return useVocabularySetMaps(campaignId, DAMAGE_TYPE_SET_ID)
}
