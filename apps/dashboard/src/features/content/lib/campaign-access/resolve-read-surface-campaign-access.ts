import {
  resolveDefaultResolvedContentCampaignAccess,
  type ContentTypeKey,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'

/** Presentation-only default when list rows omit a stored campaign-access overlay. */
export function resolveReadSurfaceCampaignAccess(
  contentTypeKey: ContentTypeKey,
  stored?: ResolvedContentCampaignAccess,
): ResolvedContentCampaignAccess {
  return stored ?? resolveDefaultResolvedContentCampaignAccess(contentTypeKey)
}
