import { useId } from 'react'

import { Modal } from '@rpg/ui'

import { CREATE_SETUP_DEFAULT_CHANGE_LABEL } from './create-setup.constants'
import { CreateSetupFooter } from './create-setup-footer'
import { buildCreateSetupPanelItems } from './create-setup-panel-items'
import { useCreateSetupSequence } from './use-create-setup-sequence'
import type {
  CreateSetupExternalDecision,
  CreateSetupSequenceModel,
  CreateSetupSet,
  CreateSetupValueChangeEvent,
} from './create-setup.types'
import { createSetupModalBodyClasses } from './create-setup.variants'

export type CreateSetupPanelProps = {
  sets: CreateSetupSet[]
  model: CreateSetupSequenceModel
  onSetupValueChange: (event: CreateSetupValueChangeEvent) => void
  changeLabel?: string
  className?: string
}

/** Ordered setup stack — sequencer + kind-specific controls. */
export function CreateSetupPanel({
  sets,
  model,
  onSetupValueChange,
  changeLabel = CREATE_SETUP_DEFAULT_CHANGE_LABEL,
  className = createSetupModalBodyClasses,
}: CreateSetupPanelProps) {
  const baseId = useId()

  const panelItems = buildCreateSetupPanelItems({
    baseId,
    sets,
    model,
    changeLabel,
    onSetupValueChange,
  })

  return <div className={className}>{panelItems}</div>
}

export type CreateSetupShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  headline: string
  /**
   * Modal header subhead. Defaults to `false` (hidden). Pass a string for custom
   * copy when a feature needs setup guidance above the panel.
   */
  subhead?: string | false
  sets: CreateSetupSet[]
  changeLabel?: string
  onSetupValueChange: (event: CreateSetupValueChangeEvent) => void
  onContinue: () => void
  externalDecisions?: readonly CreateSetupExternalDecision[]
}

/** Shared create-setup modal: partial summary rows + ID-sequenced expansion. */
export function CreateSetupShell({
  open,
  onOpenChange,
  headline,
  subhead = false,
  sets,
  changeLabel,
  onSetupValueChange,
  onContinue,
  externalDecisions,
}: CreateSetupShellProps) {
  const handleSetupComplete = () => {
    onContinue()
    onOpenChange(false)
  }

  const model = useCreateSetupSequence(sets, {
    externalDecisions,
    onSetupComplete: handleSetupComplete,
  })

  const description = typeof subhead === 'string' ? subhead : undefined

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm" {...(!description ? { 'aria-describedby': undefined } : {})}>
        <Modal.Header headline={headline} description={description} />
        <Modal.Body>
          <CreateSetupPanel
            sets={sets}
            model={model}
            onSetupValueChange={onSetupValueChange}
            changeLabel={changeLabel}
          />
        </Modal.Body>
        <Modal.Footer>
          <CreateSetupFooter
            model={model}
            onCancel={() => onOpenChange(false)}
            onSetupComplete={handleSetupComplete}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
