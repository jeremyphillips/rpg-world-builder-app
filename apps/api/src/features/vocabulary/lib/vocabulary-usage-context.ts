import type { CampaignRole } from '@rpg/contracts'

import type { VocabularyUsageViewerContext } from './reference-sources/characters-languages'

export type VocabularyUsageResolverContext = {
  campaignId: string
  viewer?: VocabularyUsageViewerContext
}

export function buildVocabularyUsageResolverContext(input: {
  campaignId: string
  viewer?: {
    userId: string
    role: CampaignRole
    controlledCharacterIds: readonly string[]
  }
}): VocabularyUsageResolverContext {
  return {
    campaignId: input.campaignId,
    ...(input.viewer ? { viewer: input.viewer } : {}),
  }
}
