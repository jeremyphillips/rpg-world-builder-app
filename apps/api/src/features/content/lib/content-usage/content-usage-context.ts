import type { CampaignRole } from '@rpg/contracts'

import type {
  ContentUsageViewerContext,
  ControlledCharacterHitCache,
} from './reference-sources/characters'

/** Orchestration scope — loaders choose records; extractors stay pure. */
export type ContentUsagePurpose = 'viewer_display' | 'authoritative_guard'

export type ContentUsageResolverContext = {
  campaignId: string
  /** Defaults to viewer_display when omitted. */
  purpose?: ContentUsagePurpose
  viewer?: ContentUsageViewerContext
  /** Request-scoped dedupe for controlled-character Mongo loads keyed by descriptor. */
  controlledCharacterHitCache?: ControlledCharacterHitCache
}

export function resolveContentUsagePurpose(ctx: ContentUsageResolverContext): ContentUsagePurpose {
  return ctx.purpose ?? 'viewer_display'
}

export function withAuthoritativeGuardPurpose(
  ctx: ContentUsageResolverContext,
): ContentUsageResolverContext {
  return { ...ctx, purpose: 'authoritative_guard' }
}

export function buildContentUsageResolverContext(input: {
  campaignId: string
  purpose?: ContentUsagePurpose
  viewer?: {
    userId: string
    role: CampaignRole
    controlledCharacterIds: readonly string[]
  }
  controlledCharacterHitCache?: ControlledCharacterHitCache
}): ContentUsageResolverContext {
  return {
    campaignId: input.campaignId,
    ...(input.purpose ? { purpose: input.purpose } : {}),
    ...(input.viewer ? { viewer: input.viewer } : {}),
    ...(input.controlledCharacterHitCache
      ? { controlledCharacterHitCache: input.controlledCharacterHitCache }
      : {}),
  }
}
