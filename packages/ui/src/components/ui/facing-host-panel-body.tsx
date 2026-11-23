import { FacingBody } from './facing-body'
import { FacingGuidance } from './facing-host-panel-chrome'
import type { FacingHostPanelModel } from './facing-host-panel-model'
import type { FacingPanelBodyOptions } from './facing-host-panel.lib'

export function FacingHostPanelBody({
  model,
  options,
}: {
  model: FacingHostPanelModel
  options: FacingPanelBodyOptions
}) {
  if (model.status === 'ready' && model.document) {
    return (
      <FacingBody
        blocks={model.document.blocks}
        proseTone={options.proseTone}
        renderTable={options.renderTable}
      />
    )
  }

  if (model.status === 'incomplete' && model.document) {
    return (
      <>
        <FacingBody
          blocks={model.document.blocks}
          proseTone={options.proseTone}
          renderTable={options.renderTable}
        />
        {model.message ? <FacingGuidance message={model.message} /> : null}
      </>
    )
  }

  return null
}
