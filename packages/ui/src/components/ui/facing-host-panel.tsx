import type { ReactNode } from 'react'
import type { ContentTable, FacingResolution } from '@rpg/contracts'

import { Eyebrow } from './eyebrow'
import { Panel } from './panel'
import { Text } from './text'
import { FacingGuidance, FacingHostInvalidPanel } from './facing-host-panel-chrome'
import { FacingHostPanelBody } from './facing-host-panel-body'
import {
  facingPanelGuidanceMessage,
  facingPanelHasContent,
  facingPanelTitle,
} from './facing-host-panel.lib'
import { RULES_PREVIEW_DEFAULT_LABEL } from './rules-preview'

export type FacingHostPanelProps = {
  label?: string
  context?: string
  resolution: FacingResolution | undefined
  proseTone?: 'default' | 'muted'
  renderTable?: (table: ContentTable) => ReactNode
  /** Attack-bonus metadata and similar chrome — not facing blocks. */
  chromeTrailing?: ReactNode
}

/** Authoring preview shell for one structured row's facing resolution. */
export function FacingHostPanel({
  label = RULES_PREVIEW_DEFAULT_LABEL,
  context,
  resolution,
  proseTone = 'muted',
  renderTable,
  chromeTrailing,
}: FacingHostPanelProps) {
  if (!resolution) return null

  if (resolution.status === 'invalid') {
    return <FacingHostInvalidPanel label={label} code={resolution.code} />
  }

  const title = facingPanelTitle(resolution)
  const body = <FacingHostPanelBody resolution={resolution} options={{ proseTone, renderTable }} />
  const guidance = facingPanelGuidanceMessage(resolution)

  if (!facingPanelHasContent({ title, body, guidance, chromeTrailing })) return null

  return (
    <Panel tone="subtle" density="compact">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <Eyebrow size="sm">{label}</Eyebrow>
        {context ? (
          <Text as="span" variant="supporting">
            {context}
          </Text>
        ) : null}
      </div>
      {title ? (
        <Text variant="emphasis" className="mb-0.5">
          {title}
        </Text>
      ) : null}
      <div className="flex flex-col gap-1">
        {body}
        {guidance ? <FacingGuidance message={guidance} /> : null}
        {chromeTrailing}
      </div>
    </Panel>
  )
}
