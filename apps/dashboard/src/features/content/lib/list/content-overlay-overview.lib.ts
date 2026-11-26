import type { ContentOverlayFailureOverviewRow } from './create-content-list'

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
  return 'Overlay unresolved'
}
