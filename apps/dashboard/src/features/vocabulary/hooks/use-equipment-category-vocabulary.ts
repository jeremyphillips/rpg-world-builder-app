import { EQUIPMENT_CATEGORY_SET_ID } from '@rpg/contracts'

import { useVocabularySetMaps } from './use-vocabulary-set-maps'

/** Campaign-resolved equipment category labels and active ids. */
export function useEquipmentCategoryVocabulary(campaignId: string | undefined) {
  return useVocabularySetMaps(campaignId, EQUIPMENT_CATEGORY_SET_ID)
}
