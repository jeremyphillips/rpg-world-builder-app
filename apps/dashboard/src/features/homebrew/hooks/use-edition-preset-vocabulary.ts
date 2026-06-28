import { EDITION_PRESET_SET_ID } from '@rpg/contracts'

import { buildEditionPresetVocabulary } from '../lib/vocabulary/sets/edition-presets'
import { useVocabularySet } from './use-vocabulary-set'

/** Campaign-resolved edition preset labels and active ids for mechanics forms. */
export function useEditionPresetVocabulary(campaignId: string | undefined) {
  const query = useVocabularySet(campaignId, EDITION_PRESET_SET_ID)

  return {
    ...query,
    vocabulary: query.data ? buildEditionPresetVocabulary(query.data) : undefined,
  }
}
