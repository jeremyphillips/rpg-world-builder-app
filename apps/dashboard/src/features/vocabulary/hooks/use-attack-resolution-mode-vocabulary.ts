import { ATTACK_RESOLUTION_MODE_SET_ID } from '@rpg/contracts'

import { buildAttackResolutionModeVocabulary } from '../lib/sets/attack-resolution-modes'
import { useVocabularySet } from './use-vocabulary-set'

/** Campaign-resolved attack resolution mode labels and active ids for mechanics forms. */
export function useAttackResolutionModeVocabulary(campaignId: string | undefined) {
  const query = useVocabularySet(campaignId, ATTACK_RESOLUTION_MODE_SET_ID)

  return {
    ...query,
    vocabulary: query.data ? buildAttackResolutionModeVocabulary(query.data) : undefined,
  }
}
