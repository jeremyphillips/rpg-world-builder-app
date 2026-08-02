import { useMemo } from 'react'
import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'

import { buildCreatureTypeVocabulary } from '../lib/sets/creature-types'
import { useVocabularySetMaps } from './use-vocabulary-set-maps'

/** Campaign-resolved creature type labels and active ids for forms and tables. */
export function useCreatureTypeVocabulary(campaignId: string | undefined) {
  const query = useVocabularySetMaps(campaignId, CREATURE_TYPE_SET_ID)

  const vocabulary = useMemo(
    () => (query.data ? buildCreatureTypeVocabulary(query.data) : undefined),
    [query.data],
  )

  return {
    ...query,
    vocabulary,
  }
}
