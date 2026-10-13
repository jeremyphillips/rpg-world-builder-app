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

export function campaignAccessPatchesEqual(
  left: ContentCampaignAccessPatch | undefined,
  right: ContentCampaignAccessPatch | undefined,
): boolean {
  if (left === right) return true
  if (!left || !right) return false
  if (left.available !== right.available || left.visibilityMode !== right.visibilityMode) {
    return false
  }
  if (left.participantIds.length !== right.participantIds.length) return false
  return left.participantIds.every((id, index) => id === right.participantIds[index])
}

/** Stable dependency for participant registration — ignores object identity from `useWatch`. */
export function campaignAccessPatchRegistrationKey(
  patch: ContentCampaignAccessPatch | undefined,
): string {
  if (!patch) return ''
  return `${patch.available}|${patch.visibilityMode}|${patch.participantIds.join(',')}`
}

/** Stable sync key for resolved access baselines — ignores object identity from parents. */
export function campaignAccessResolvedBaselineKey(access: ResolvedContentCampaignAccess): string {
  return campaignAccessPatchRegistrationKey(resolvedToCampaignAccessPatch(access))
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
