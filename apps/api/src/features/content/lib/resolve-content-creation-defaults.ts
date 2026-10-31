import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type ApiContentTypeKey,
  type CatalogLayer,
  type ContentStatus,
  type ResolvedContentCampaignAccess,
  resolveContentCampaignAccess,
  resolveDefaultContentCampaignAccess,
} from '@rpg/contracts'

export type ContentCreationMode = 'duplicate' | 'ordinary'

export interface ContentCreationDefaults {
  status: ContentStatus
  catalogLayer: CatalogLayer
  /**
   * Resolved campaign-access default when no overlay row exists — documentation
   * only; not written on create. List reads resolve via `resolveContentCampaignAccess(null)`.
   */
  resolvedCampaignAccessDefault: ResolvedContentCampaignAccess
}

export function resolveContentCreationDefaults(options: {
  mode: ContentCreationMode
  contentTypeKey?: ApiContentTypeKey
}): ContentCreationDefaults {
  const resolvedCampaignAccessDefault = resolveContentCampaignAccess(null, {
    validParticipantIds: [],
    defaultAccess: options.contentTypeKey
      ? resolveDefaultContentCampaignAccess(options.contentTypeKey)
      : DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  })

  if (options.mode === 'duplicate') {
    return {
      status: 'draft',
      catalogLayer: 'homebrew',
      resolvedCampaignAccessDefault,
    }
  }

  return {
    status: 'published',
    catalogLayer: 'homebrew',
    resolvedCampaignAccessDefault,
  }
}
