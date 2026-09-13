import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  resolveContentCampaignAccess,
  type ContentCampaignAccessPatch,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'

/** Resolves species overlay campaign access from the edit-session draft. */
export function resolveSpeciesParentCampaignAccess(
  pendingAccess: ContentCampaignAccessPatch | undefined,
): ResolvedContentCampaignAccess {
  return resolveContentCampaignAccess(pendingAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS)
}
