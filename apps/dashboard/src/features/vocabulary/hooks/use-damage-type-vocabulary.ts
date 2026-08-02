import { DAMAGE_TYPE_SET_ID } from '@rpg/contracts'

import { buildDamageTypeVocabulary } from '../lib/sets/damage-types'
import { useVocabularySet } from './use-vocabulary-set'

/** Campaign-resolved damage type labels and active ids for forms and tables. */
export function useDamageTypeVocabulary(campaignId: string | undefined) {
  const query = useVocabularySet(campaignId, DAMAGE_TYPE_SET_ID)

  return {
    ...query,
    vocabulary: query.data ? buildDamageTypeVocabulary(query.data) : undefined,
  }
}
