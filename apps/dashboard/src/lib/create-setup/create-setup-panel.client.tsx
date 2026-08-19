'use client'

import { useId } from 'react'

import { Button, Modal, dialogPanelActionRowClasses } from '@rpg/ui'

import { CREATE_SETUP_DEFAULT_CHANGE_LABEL } from './create-setup.constants'
import { buildCreateSetupPanelItems } from './create-setup-panel-items.client'
import { useCreateSetupSequence } from './use-create-setup-sequence.client'
import type {
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
  /** Escape hatch for extra validation beyond required set completion. */
  additionalContinueConstraint?: boolean
}

/** Shared create-setup modal: compact selected summaries + ID-sequenced expansion. */
export function CreateSetupShell({
  open,
  onOpenChange,
  headline,
  subhead = false,
  sets,
  changeLabel,
  onSetupValueChange,
  onContinue,
  additionalContinueConstraint = true,
}: CreateSetupShellProps) {
  const model = useCreateSetupSequence(sets, { additionalContinueConstraint })
  const canContinue = model.canContinue

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
          <div className={dialogPanelActionRowClasses}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canContinue}
              onClick={() => {
                if (!canContinue) return
                onContinue()
                onOpenChange(false)
              }}
            >
              Continue
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
