import type { ReactNode } from 'react'
import type { ContentTable, FacingInvalidCode, FacingResolution } from '@rpg/contracts'

export const FACING_INVALID_MESSAGES: Record<FacingInvalidCode, string> = {
  'missing-kind': 'This row is missing a feature kind and cannot show a preview.',
  'missing-id': 'This row is missing an identifier and cannot show a preview.',
  'host-mismatch': 'This row does not belong on this editor host.',
}

export function facingInvalidMessage(code: FacingInvalidCode): string {
  return FACING_INVALID_MESSAGES[code]
}

export function facingPanelTitle(
  resolution: Exclude<FacingResolution, { status: 'invalid' }>,
): string | undefined {
  if (resolution.status === 'ready') return resolution.document.title
  if (resolution.status === 'incomplete' && resolution.document) return resolution.document.title
  return undefined
}

export function facingPanelGuidanceMessage(
  resolution: Exclude<FacingResolution, { status: 'invalid' }>,
): string | undefined {
  if (resolution.status === 'unavailable' || resolution.status === 'failed')
    return resolution.guidance
  if (resolution.status === 'incomplete' && !resolution.document) return resolution.guidance
  return undefined
}

export function facingPanelHasContent(input: {
  title?: string
  body: ReactNode
  guidance?: string
  chromeTrailing?: ReactNode
}): boolean {
  return Boolean(input.title || input.body || input.guidance || input.chromeTrailing)
}

export type FacingPanelBodyOptions = {
  proseTone: 'default' | 'muted'
  renderTable?: (table: ContentTable) => ReactNode
}
