import type { FacingResolution } from '@rpg/contracts'

import { FacingBody } from './facing-body'
import { FacingGuidance } from './facing-host-panel-chrome'
import type { FacingPanelBodyOptions } from './facing-host-panel.lib'

export function FacingHostPanelBody({
  resolution,
  options,
}: {
  resolution: Exclude<FacingResolution, { status: 'invalid' }>
  options: FacingPanelBodyOptions
}) {
  if (resolution.status === 'ready') {
    return (
      <FacingBody
        blocks={resolution.document.blocks}
        proseTone={options.proseTone}
        renderTable={options.renderTable}
      />
    )
  }

  if (resolution.status === 'incomplete' && resolution.document) {
    return (
      <>
        <FacingBody
          blocks={resolution.document.blocks}
          proseTone={options.proseTone}
          renderTable={options.renderTable}
        />
        <FacingGuidance message={resolution.guidance} />
      </>
    )
  }

  return null
}
