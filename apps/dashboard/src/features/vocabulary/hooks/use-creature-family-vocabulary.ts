import { useMemo } from 'react'
import { CREATURE_FAMILY_SET_ID } from '@rpg/contracts'
import { useVocabularySet } from './use-vocabulary-set'
import {
  buildCreatureFamilyVocabulary,
  buildSeedCreatureFamilyVocabulary,
} from '../lib/sets/creature-families'

/** Seed fallback is only for explicitly campaign-free forms. */
export function useCreatureFamilyVocabulary(campaignId: string | undefined) {
  const query = useVocabularySet(campaignId, CREATURE_FAMILY_SET_ID)
  const vocabulary = useMemo(
    () =>
      campaignId
        ? query.data
          ? buildCreatureFamilyVocabulary(query.data)
          : undefined
        : buildSeedCreatureFamilyVocabulary(),
    [campaignId, query.data],
  )
  return { ...query, vocabulary, isPending: Boolean(campaignId) && query.isPending }
}
