import { useMemo } from 'react'
import { DEFAULT_SYSTEM_RULESET_ID, LANGUAGE_SET_ID } from '@rpg/contracts'

import { useCampaigns } from '@/features/campaign/hooks/use-campaigns'

import {
  buildActiveLanguageCategoryFieldOptions,
  buildLanguageVocabulary,
} from '../lib/vocabulary/sets/languages'
import { useVocabularySet } from './use-vocabulary-set'

/** Campaign-resolved language labels, categories, and active ids for forms and tables. */
export function useLanguageVocabulary(campaignId: string | undefined) {
  const query = useVocabularySet(campaignId, LANGUAGE_SET_ID)
  const { data: campaigns } = useCampaigns()

  const rulesetId = useMemo(() => {
    if (!campaignId) return DEFAULT_SYSTEM_RULESET_ID
    return (
      campaigns?.find((campaign) => campaign.id === campaignId)?.rulesetId ??
      DEFAULT_SYSTEM_RULESET_ID
    )
  }, [campaignId, campaigns])

  const vocabulary = useMemo(
    () => (query.data ? buildLanguageVocabulary(query.data, rulesetId) : undefined),
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
  }
}
