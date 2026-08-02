import { SENSE_SET_ID } from '@rpg/contracts'

import { buildSenseVocabulary } from '../lib/sets/senses'
import { useVocabularySet } from './use-vocabulary-set'

/** Campaign-resolved sense labels and active ids for forms and tables. */
export function useSenseVocabulary(campaignId: string | undefined) {
  const query = useVocabularySet(campaignId, SENSE_SET_ID)

  return {
    ...query,
    vocabulary: query.data ? buildSenseVocabulary(query.data) : undefined,
  }
}
