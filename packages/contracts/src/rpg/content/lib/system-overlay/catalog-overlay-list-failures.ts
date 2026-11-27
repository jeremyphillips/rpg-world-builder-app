import { z } from 'zod'

import type { OverlayApplyFailure } from './overlay-failures'

/** Public wire codes for list `overlayFailures` (matches API `throwOverlayFailure` codes). */
export const CATALOG_OVERLAY_LIST_FAILURE_CODES = [
  'unsupported_overlay_version',
  'unsupported_overlay_retention',
  'overlay_validation',
  'overlay_invalid_order',
] as const

export const catalogOverlayListFailureCodeSchema = z.enum(CATALOG_OVERLAY_LIST_FAILURE_CODES)

export type CatalogOverlayListFailureCode = z.infer<typeof catalogOverlayListFailureCodeSchema>

export const catalogOverlayListFailureSchema = z.object({
  targetId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  code: catalogOverlayListFailureCodeSchema,
  message: z.string().min(1),
})

export type CatalogOverlayListFailure = z.infer<typeof catalogOverlayListFailureSchema>

export type CatalogOverlayListFailureSeedRow = {
  id: string
  slug: string
  name: string
}

const CATALOG_OVERLAY_LIST_FAILURE_MESSAGES: Record<CatalogOverlayListFailureCode, string> = {
  unsupported_overlay_version: 'System overlay patch is missing a supported version.',
  unsupported_overlay_retention: 'System overlay uses unsupported retention.',
  overlay_validation: 'Stored system overlay is invalid.',
  overlay_invalid_order: 'Stored system overlay has invalid collection order.',
}

export function overlayApplyFailureToListCode(
  failure: OverlayApplyFailure,
): CatalogOverlayListFailureCode {
  switch (failure.code) {
    case 'unsupported-overlay-version':
      return 'unsupported_overlay_version'
    case 'unsupported-overlay-retention':
      return 'unsupported_overlay_retention'
    case 'overlay-validation':
      return 'overlay_validation'
    case 'overlay-invalid-order':
      return 'overlay_invalid_order'
  }
}

export function catalogOverlayListFailureMessage(code: CatalogOverlayListFailureCode): string {
  return CATALOG_OVERLAY_LIST_FAILURE_MESSAGES[code]
}

export function overlayFailureToListEntry(
  seedRow: CatalogOverlayListFailureSeedRow,
  failure: OverlayApplyFailure,
): CatalogOverlayListFailure {
  const code = overlayApplyFailureToListCode(failure)
  return {
    targetId: seedRow.id,
    slug: seedRow.slug,
    name: seedRow.name,
    code,
    message: catalogOverlayListFailureMessage(code),
  }
}
