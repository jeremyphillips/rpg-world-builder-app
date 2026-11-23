import type { ReactNode } from 'react'
import type { ContentTable } from '@rpg/contracts'

import { Eyebrow } from './eyebrow'
import { Panel } from './panel'
import { Text } from './text'
import { FacingGuidance } from './facing-host-panel-chrome'
import { FacingHostPanelBody } from './facing-host-panel-body'
import { FacingHostPanelMetadata } from './facing-host-panel-metadata'
import type { FacingHostPanelModel } from './facing-host-panel-model'
import { facingHostPanelLayout } from './facing-host-panel.lib'
import { RULES_PREVIEW_DEFAULT_LABEL } from './rules-preview'

export type { FacingHostPanelModel } from './facing-host-panel-model'

export type FacingHostPanelProps = {
  label?: string
  model: FacingHostPanelModel | undefined
  proseTone?: 'default' | 'muted'
  renderTable?: (table: ContentTable) => ReactNode
}

/** Authoring preview shell for one structured row's facing display model. */
export function FacingHostPanel({
  label = RULES_PREVIEW_DEFAULT_LABEL,
  model,
  proseTone = 'muted',
  renderTable,
}: FacingHostPanelProps) {
  if (!model) return null

  const layout = facingHostPanelLayout(model)
  if (!layout.hasContent) return null

  const body = <FacingHostPanelBody model={model} options={{ proseTone, renderTable }} />

  return (
    <Panel tone="subtle" density="compact">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <Eyebrow size="sm">{label}</Eyebrow>
        {model.context ? (
          <Text as="span" variant="supporting">
            {model.context}
          </Text>
        ) : null}
      </div>
      {layout.title ? (
        <Text variant="emphasis" className="mb-0.5">
          {layout.title}
        </Text>
      ) : null}
      <div className="flex flex-col gap-1">
        {body}
        {layout.showStandaloneGuidance && layout.guidance ? (
          <FacingGuidance message={layout.guidance} tone={layout.guidanceTone} />
        ) : null}
        {model.metadataRows ? <FacingHostPanelMetadata rows={model.metadataRows} /> : null}
      </div>
    </Panel>
  )
}
