import { useMemo } from 'react'
import { DEFAULT_SYSTEM_RULESET_ID, LANGUAGE_SET_ID } from '@rpg/contracts'

import { lookupCampaignRulesetId, resolvedCampaignRulesetId } from '@/lib/campaign-ruleset.lib'
import { useCampaigns } from '@/lib/campaign/campaigns-query'

import {
  buildActiveLanguageCategoryFieldOptions,
  buildLanguageVocabulary,
} from '../lib/sets/languages'
import { useVocabularySet } from './use-vocabulary-set'

/** Campaign-resolved language labels, categories, and active ids for forms and tables. */
export function useLanguageVocabulary(campaignId: string | undefined) {
  const query = useVocabularySet(campaignId, LANGUAGE_SET_ID)
  const campaignsQuery = useCampaigns()

  const rulesetId = useMemo(() => {
    if (!campaignId) return DEFAULT_SYSTEM_RULESET_ID
    const lookup = lookupCampaignRulesetId({
      campaignId,
      campaigns: campaignsQuery.data,
      campaignsPending: campaignsQuery.isPending,
      campaignsError: campaignsQuery.isError,
    })
    return resolvedCampaignRulesetId(lookup)
  }, [campaignId, campaignsQuery.data, campaignsQuery.isError, campaignsQuery.isPending])

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
  }
}
