import type { ReactNode } from 'react'
import type { ContentTable } from '@rpg/contracts'

import type { FacingHostPanelModel } from './facing-host-panel-model'

export function facingPanelTitle(model: FacingHostPanelModel): string | undefined {
  if (model.status === 'ready' && model.document) return model.document.title
  if (model.status === 'incomplete' && model.document) return model.document.title
  return undefined
}

export function facingPanelGuidanceMessage(model: FacingHostPanelModel): string | undefined {
  if (
    model.status === 'incomplete' ||
    model.status === 'invalid' ||
    model.status === 'unavailable'
  ) {
    return model.message
  }
  if (model.status === 'failed') return model.message
  return undefined
}

export function facingPanelHasContent(input: {
  title?: string
  body: ReactNode
  guidance?: string
  metadataRows?: readonly unknown[]
  context?: string
}): boolean {
  return Boolean(
    input.title || input.body || input.guidance || input.metadataRows?.length || input.context,
  )
}

export type FacingPanelBodyOptions = {
  proseTone: 'default' | 'muted'
  renderTable?: (table: ContentTable) => ReactNode
}

function facingHostPanelHasBody(model: FacingHostPanelModel): boolean {
  if (model.status === 'ready' && model.document) return model.document.blocks.length > 0
  return model.status === 'incomplete' && Boolean(model.document?.blocks.length)
}

export function facingHostPanelLayout(model: FacingHostPanelModel) {
  const title = facingPanelTitle(model)
  const guidance = facingPanelGuidanceMessage(model)
  const hasContent = Boolean(
    title ||
    facingHostPanelHasBody(model) ||
    guidance ||
    model.metadataRows?.length ||
    model.context,
  )

  return {
    title,
    guidance,
    guidanceTone: model.status === 'failed' ? ('failure' as const) : ('neutral' as const),
    showStandaloneGuidance: Boolean(guidance && (model.status !== 'incomplete' || !model.document)),
    hasContent,
  }
}
