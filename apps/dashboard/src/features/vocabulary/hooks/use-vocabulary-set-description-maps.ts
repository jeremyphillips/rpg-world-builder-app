import { useMemo } from 'react'
import type { VocabularyOptionSetId } from '@rpg/contracts'

import {
  buildLabelDescriptionActiveVocabulary,
  type LabelDescriptionActiveVocabulary,
} from '../lib/build-vocabulary-maps'
import { useVocabularySet } from './use-vocabulary-set'

/** Campaign-resolved label, description, and active-id maps for any set id. */
export function useVocabularySetDescriptionMaps(
  campaignId: string | undefined,
  setId: VocabularyOptionSetId | undefined,
  enabled = true,
) {
  const query = useVocabularySet(campaignId, setId, enabled)

  const vocabulary = useMemo(
    (): LabelDescriptionActiveVocabulary | undefined =>
      query.data ? buildLabelDescriptionActiveVocabulary(query.data) : undefined,
    [query.data],
  )

  return {
    ...query,
    vocabulary,
  }
}

export type { LabelDescriptionActiveVocabulary }
