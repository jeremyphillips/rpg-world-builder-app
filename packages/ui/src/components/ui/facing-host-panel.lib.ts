import type { ReactNode } from 'react'
import type { ContentTable, FacingResolution } from '@rpg/contracts'
import {
  FACING_INVALID_PANEL_MESSAGES as FACING_INVALID_MESSAGES,
  facingInvalidMessage,
} from '@rpg/contracts'

export { FACING_INVALID_MESSAGES, facingInvalidMessage }

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
