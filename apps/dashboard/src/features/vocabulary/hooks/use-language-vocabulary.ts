import { useMemo } from 'react'
import { LANGUAGE_SET_ID, type SystemRulesetId } from '@rpg/contracts'

import { useCampaignRulesetLookup } from '@/lib/use-campaign-ruleset-lookup'

import {
  buildActiveLanguageCategoryFieldOptions,
  buildLanguageVocabulary,
} from '../lib/sets/languages'
import { useVocabularySet } from './use-vocabulary-set'

type UseLanguageVocabularyOptions = {
  /** Explicit system seed ruleset when no campaign is in scope (game-terms sheet). */
  seedRulesetId?: SystemRulesetId
}

/** Campaign-resolved language labels, categories, and active ids for forms and tables. */
export function useLanguageVocabulary(
  campaignId: string | undefined,
  options?: UseLanguageVocabularyOptions,
) {
  const query = useVocabularySet(campaignId, LANGUAGE_SET_ID)
  const { rulesetId: campaignRulesetId, isPending, isError } = useCampaignRulesetLookup(campaignId)

  const rulesetId = useMemo(() => {
    if (campaignId) return campaignRulesetId
    return options?.seedRulesetId
  }, [campaignId, campaignRulesetId, options?.seedRulesetId])

  const vocabulary = useMemo(
    () => (query.data && rulesetId ? buildLanguageVocabulary(query.data, rulesetId) : undefined),
    [query.data, rulesetId],
  )

  const categoryOptions = useMemo(
    () => buildActiveLanguageCategoryFieldOptions(vocabulary),
    [vocabulary],
  )

  return {
    ...query,
    vocabulary,
    categoryOptions,
    rulesetLookupPending: Boolean(campaignId) && isPending,
    rulesetLookupError: Boolean(campaignId) && isError,
  }
}
