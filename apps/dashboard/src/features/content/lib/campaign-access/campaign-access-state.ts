import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type ContentCampaignAccess,
  type ContentCampaignAccessPatch,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'

export function toCampaignAccessPatch(
  access: Pick<ContentCampaignAccess, 'available' | 'visibilityMode' | 'participantIds'>,
): ContentCampaignAccessPatch {
  return {
    available: access.available,
    visibilityMode: access.visibilityMode,
    participantIds: access.participantIds,
  }
}

export function resolvedToCampaignAccessPatch(
  access: ResolvedContentCampaignAccess,
): ContentCampaignAccessPatch {
  return toCampaignAccessPatch(access)
}

export function isDefaultCampaignAccessPatch(patch: ContentCampaignAccessPatch): boolean {
  return (
    patch.available === DEFAULT_CONTENT_CAMPAIGN_ACCESS.available &&
    patch.visibilityMode === DEFAULT_CONTENT_CAMPAIGN_ACCESS.visibilityMode &&
    patch.participantIds.length === 0
  )
}
