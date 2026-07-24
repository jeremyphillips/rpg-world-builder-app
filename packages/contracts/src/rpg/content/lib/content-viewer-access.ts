import type { ResolvedContentCampaignAccess } from './campaign-access'
import { CAMPAIGN_MANAGE_ROLES, type CampaignManageRole } from '../../../shared/roles'

/**
 * Viewer context for campaign content discovery and saved-reference reads.
 *
 * `pc.characterIds` holds every campaign-submitted PC id for the membership
 * (see campaign-access-enforcement ADR). Per-character surfaces (builder,
 * saved-reference resolution) pass a single id via `SavedContentReferenceContext`.
 */
export type ContentViewer =
  | { kind: 'manage' }
  | { kind: 'pc'; characterIds: readonly string[] }
  | { kind: 'none' }

/** Saved-character reference scope — grants read independent of discovery policy. */
export type SavedContentReferenceContext = {
  characterId: string
}

export type CampaignMembershipViewerContext = {
  campaignRole: string
  characterIds: readonly string[]
}

/** Maps campaign membership to the contracts `ContentViewer` model. */
export function buildContentViewerFromMembership(
  membership: CampaignMembershipViewerContext | undefined,
): ContentViewer {
  if (!membership) {
    return { kind: 'none' }
  }

  if (CAMPAIGN_MANAGE_ROLES.includes(membership.campaignRole as CampaignManageRole)) {
    return { kind: 'manage' }
  }

  if (membership.campaignRole === 'pc' && membership.characterIds.length > 0) {
    return { kind: 'pc', characterIds: membership.characterIds }
  }

  return { kind: 'none' }
}

/** Structured player-facing visibility facts for overview metadata. */
export type PlayerContentVisibility =
  | { kind: 'ordinary' }
  | { kind: 'specific'; otherParticipantCount: number }

/** Resolves player line-2 metadata from campaign access and viewer context. */
export function toPlayerContentVisibility(
  campaignAccess: ResolvedContentCampaignAccess,
  viewer: ContentViewer,
): PlayerContentVisibility {
  if (viewer.kind !== 'pc' || campaignAccess.visibilityMode !== 'specific_players') {
    return { kind: 'ordinary' }
  }

  const isGranted = viewer.characterIds.some((characterId) =>
    campaignAccess.participantIds.includes(characterId),
  )
  if (!isGranted) {
    return { kind: 'ordinary' }
  }

  const viewerCharacterIds = new Set(viewer.characterIds)
  const otherParticipantCount = campaignAccess.participantIds.filter(
    (participantId) => !viewerCharacterIds.has(participantId),
  ).length

  return { kind: 'specific', otherParticipantCount }
}

/**
 * Whether content may appear on discovery surfaces (catalog lists, overview tables,
 * builder pickers). Managers bypass all campaign-access visibility modes.
 */
export function isContentDiscoverableForViewer(
  campaignAccess: ResolvedContentCampaignAccess,
  viewer: ContentViewer,
): boolean {
  if (viewer.kind === 'manage') {
    return true
  }

  if (!campaignAccess.available || campaignAccess.effectiveAudience === 'none') {
    return false
  }

  switch (campaignAccess.visibilityMode) {
    case 'all_players':
      return true
    case 'dm_only':
      return false
    case 'specific_players':
      return (
        viewer.kind === 'pc' &&
        viewer.characterIds.some((characterId) =>
          campaignAccess.participantIds.includes(characterId),
        )
      )
    default: {
      const _exhaustive: never = campaignAccess.visibilityMode
      return _exhaustive
    }
  }
}

/**
 * Whether a saved-character reference may be resolved for display. Campaign access
 * controls new discovery — it does not revoke reads for content already on a
 * saved character sheet.
 */
export function canResolveSavedContentReference(
  viewer: ContentViewer,
  reference: SavedContentReferenceContext,
): boolean {
  if (viewer.kind === 'manage') {
    return true
  }

  return viewer.kind === 'pc' && viewer.characterIds.includes(reference.characterId)
}
