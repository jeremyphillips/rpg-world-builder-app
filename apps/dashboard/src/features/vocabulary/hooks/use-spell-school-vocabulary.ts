import { SPELL_SCHOOL_SET_ID } from '@rpg/contracts'

import { useVocabularySetDescriptionMaps } from './use-vocabulary-set-description-maps'

/** Campaign-resolved spell school labels, descriptions, and active ids. */
export function useSpellSchoolVocabulary(campaignId: string | undefined) {
  return useVocabularySetDescriptionMaps(campaignId, SPELL_SCHOOL_SET_ID)
}
