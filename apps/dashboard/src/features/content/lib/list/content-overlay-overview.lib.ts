import type { ResolvedContentCampaignAccess } from '@rpg/contracts'

import type { ContentOverlayFailureOverviewRow } from './create-content-list'

/** Shared manager-facing label for list surfaces that surface unresolved system overlays. */
export const CONTENT_OVERLAY_UNRESOLVED_STATUS_LABEL = 'Overlay unresolved' as const

/**
 * Presentation-only discoverability for merged overlay-failure overview rows.
 * Not authoritative campaign access — bucket math uses
 * {@link overlayFailureOverviewRowParticipatesInCampaignAvailability} and
 * {@link contentRowPassesCampaignAvailabilityFilter} instead of this object’s `available` flag.
 */
export const CONTENT_OVERLAY_FAILURE_ROW_CAMPAIGN_ACCESS: ResolvedContentCampaignAccess = {
  available: true,
  visibilityMode: 'dm_only',
  participantIds: [],
  unavailableParticipantIds: [],
  effectiveAudience: 'dm_only',
}

/** Unresolved overlay overview rows sit outside campaign available/unavailable buckets. */
export function overlayFailureOverviewRowParticipatesInCampaignAvailability(row: unknown): boolean {
  return !isContentOverlayFailureOverviewRow(row)
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
