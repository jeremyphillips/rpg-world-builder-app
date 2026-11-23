import type { FacingInvalidCode } from './facing-document'

/** Master–detail preview panel (`StructuredFacingHostPanel`) vs published detail body. */
export type FacingInvalidSurface = 'panel' | 'detail'

export const FACING_INVALID_PANEL_MESSAGES = {
  'missing-kind': 'This row is missing a feature kind and cannot show a preview.',
  'missing-id': 'This row is missing an identifier and cannot show a preview.',
  'host-mismatch': 'This row does not belong on this editor host.',
} as const satisfies Record<FacingInvalidCode, string>

export const FACING_INVALID_DETAIL_MESSAGES = {
  'missing-kind': 'This feature is missing a kind.',
  'missing-id': 'This feature is missing an identifier.',
  'host-mismatch': 'This feature does not belong on this detail host.',
} as const satisfies Record<FacingInvalidCode, string>

const FACING_INVALID_BY_SURFACE = {
  panel: FACING_INVALID_PANEL_MESSAGES,
  detail: FACING_INVALID_DETAIL_MESSAGES,
} as const satisfies Record<FacingInvalidSurface, Record<FacingInvalidCode, string>>

export function facingInvalidMessage(
  code: FacingInvalidCode,
  surface: FacingInvalidSurface = 'panel',
): string {
  return FACING_INVALID_BY_SURFACE[surface][code]
}
