import type { ResolvedContentCampaignAccess } from '@rpg/contracts'

import type { ContentOverlayFailureOverviewRow } from './create-content-list'

/** Shared manager-facing label for list surfaces that surface unresolved system overlays. */
export const CONTENT_OVERLAY_UNRESOLVED_STATUS_LABEL = 'Overlay unresolved' as const

/**
 * Synthetic overlay-failure overview rows are manager diagnostics. Use dm_only
 * discoverability metadata so presentation filtering aligns with API list policy
 * without implying all_players campaign access.
 */
export const CONTENT_OVERLAY_FAILURE_ROW_CAMPAIGN_ACCESS: ResolvedContentCampaignAccess = {
  available: true,
  visibilityMode: 'dm_only',
  participantIds: [],
  unavailableParticipantIds: [],
  effectiveAudience: 'dm_only',
}

export function isContentOverlayFailureOverviewRow(
  row: unknown,
): row is ContentOverlayFailureOverviewRow {
  return (
    typeof row === 'object' &&
    row !== null &&
    'contentOverlayResolveFailure' in row &&
    (row as ContentOverlayFailureOverviewRow).contentOverlayResolveFailure === true
  )
}

export function overlayFailureOverviewStatusLabel(row: unknown): string | undefined {
  if (!isContentOverlayFailureOverviewRow(row)) return undefined
  return CONTENT_OVERLAY_UNRESOLVED_STATUS_LABEL
}
