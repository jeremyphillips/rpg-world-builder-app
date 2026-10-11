import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  resolveDefaultContentCampaignAccess,
  type ContentAccessTargetType,
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
  return {
    available: access.available,
    visibilityMode: access.visibilityMode,
    participantIds: [...access.participantIds, ...access.unavailableParticipantIds],
  }
}

export function isDefaultCampaignAccessPatch(
  patch: ContentCampaignAccessPatch,
  targetType?: ContentAccessTargetType,
): boolean {
  const baseline = targetType
    ? resolveDefaultContentCampaignAccess(targetType)
    : DEFAULT_CONTENT_CAMPAIGN_ACCESS
  return (
    patch.available === baseline.available &&
    patch.visibilityMode === baseline.visibilityMode &&
    patch.participantIds.length === 0
  )
}
