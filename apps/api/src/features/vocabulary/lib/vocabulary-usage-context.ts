import type { CampaignRole } from '@rpg/contracts'

import type { VocabularyUsageViewerContext } from './reference-sources/characters-languages'

/** Orchestration scope — loaders choose records; extractors stay pure. */
export type VocabularyUsagePurpose = 'viewer_display' | 'authoritative_guard'

export type VocabularyUsageResolverContext = {
  campaignId: string
  /** Defaults to viewer_display when omitted. */
  purpose?: VocabularyUsagePurpose
  viewer?: VocabularyUsageViewerContext
}

export function resolveVocabularyUsagePurpose(
  ctx: VocabularyUsageResolverContext,
): VocabularyUsagePurpose {
  return ctx.purpose ?? 'viewer_display'
}

export function withAuthoritativeGuardPurpose(
  ctx: VocabularyUsageResolverContext,
): VocabularyUsageResolverContext {
  return { ...ctx, purpose: 'authoritative_guard' }
}

export function buildVocabularyUsageResolverContext(input: {
  campaignId: string
  purpose?: VocabularyUsagePurpose
  viewer?: {
    userId: string
    role: CampaignRole
    controlledCharacterIds: readonly string[]
  }
}): VocabularyUsageResolverContext {
  return {
    campaignId: input.campaignId,
    ...(input.purpose ? { purpose: input.purpose } : {}),
    ...(input.viewer ? { viewer: input.viewer } : {}),
  }
}
