import type { ContentOverlayFailureOverviewRow } from './create-content-list'

/** Shared manager-facing label for list surfaces that surface unresolved system overlays. */
export const CONTENT_OVERLAY_UNRESOLVED_STATUS_LABEL = 'Overlay unresolved' as const

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
