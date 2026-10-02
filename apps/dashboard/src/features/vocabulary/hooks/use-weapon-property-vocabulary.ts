import { WEAPON_PROPERTY_SET_ID } from '@rpg/contracts'

import { useVocabularySetMaps } from './use-vocabulary-set-maps'

/** Campaign-resolved weapon property labels and active ids for forms and tables. */
export function useWeaponPropertyVocabulary(campaignId: string | undefined) {
  return useVocabularySetMaps(campaignId, WEAPON_PROPERTY_SET_ID)
}
