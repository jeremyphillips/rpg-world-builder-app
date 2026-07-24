import type { ResolvedContentCampaignAccess } from './campaign-access'

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
