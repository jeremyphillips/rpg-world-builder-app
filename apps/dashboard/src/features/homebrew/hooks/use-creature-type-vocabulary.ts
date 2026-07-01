import { useMemo } from 'react'
import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'

import { buildCreatureTypeVocabulary } from '../lib/vocabulary/sets/creature-types'
import { useVocabularySet } from './use-vocabulary-set'

/** Campaign-resolved creature type labels and active ids for forms and tables. */
export function useCreatureTypeVocabulary(campaignId: string | undefined) {
  const query = useVocabularySet(campaignId, CREATURE_TYPE_SET_ID)

  const vocabulary = useMemo(
    () => (query.data ? buildCreatureTypeVocabulary(query.data) : undefined),
    [query.data],
  )

  return {
    ...query,
    vocabulary,
  }
}
