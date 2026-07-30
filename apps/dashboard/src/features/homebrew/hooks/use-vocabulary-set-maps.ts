import { useMemo } from 'react'
import type { VocabularyOptionSetId } from '@rpg/contracts'

import {
  buildLabelActiveVocabulary,
  type LabelActiveVocabulary,
} from '../lib/vocabulary/build-vocabulary-maps'
import { useVocabularySet } from './use-vocabulary-set'

/** Generic campaign-resolved vocabulary maps for any set id. */
export function useVocabularySetMaps(
  campaignId: string | undefined,
  setId: VocabularyOptionSetId | undefined,
  enabled = true,
) {
  const query = useVocabularySet(campaignId, setId, enabled)

  const vocabulary = useMemo(
    (): LabelActiveVocabulary | undefined =>
      query.data ? buildLabelActiveVocabulary(query.data) : undefined,
    [query.data],
  )

  return {
    ...query,
    vocabulary,
  }
}

export type { LabelActiveVocabulary }
