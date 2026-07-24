import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type ContentSource,
  type ContentStatus,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'

export type ContentCreationMode = 'duplicate' | 'ordinary'

export interface ContentCreationDefaults {
  status: ContentStatus
  source: ContentSource
  /**
   * Resolved campaign-access default when no overlay row exists — documentation
   * only; not written on create. List reads resolve via `resolveContentCampaignAccess(null)`.
   */
  resolvedCampaignAccessDefault: ResolvedContentCampaignAccess
}

export function resolveContentCreationDefaults(options: {
  mode: ContentCreationMode
}): ContentCreationDefaults {
  if (options.mode === 'duplicate') {
    return {
      status: 'draft',
      source: 'homebrew',
      resolvedCampaignAccessDefault: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    }
  }

  return {
    status: 'published',
    source: 'homebrew',
    resolvedCampaignAccessDefault: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  }
}
