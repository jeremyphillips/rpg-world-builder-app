import type { ResolvedContentCampaignAccess } from '@rpg/contracts'

import type { ContentOverlayFailureOverviewRow } from './create-content-list'

/** Shared manager-facing label for list surfaces that surface unresolved system overlays. */
export const CONTENT_OVERLAY_UNRESOLVED_STATUS_LABEL = 'Overlay unresolved' as const

/**
 * Presentation-only metadata for merged overlay-failure overview rows in the dashboard.
 *
 * Authorization and which clients receive `overlayFailures` on list routes are owned by the API
 * (`filterOverlayFailuresForListViewer` + real `campaignAccess` on each failure target). This object
 * is not a second authority: it keeps manager overview tables and `filterCatalogRowsForViewer`
 * aligned with “unresolved” UX (dm-only presentation, outside availability buckets). Other clients
 * that consume list JSON must apply API policy only.
 *
 * Bucket math uses {@link overlayFailureOverviewRowParticipatesInCampaignAvailability} and
 * {@link contentRowPassesCampaignAvailabilityFilter}, not `campaignAccess.available` on this object.
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
