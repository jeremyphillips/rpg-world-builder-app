'use client'

import { useId, useMemo, useState } from 'react'
import { Button, Modal, dialogPanelActionRowClasses } from '@rpg/ui'

import { assertCreateSetupSetsOnReset } from './create-setup-validation.lib'
import {
  CREATE_SETUP_DEFAULT_CHANGE_LABEL,
  CREATE_SETUP_DEFAULT_GROUPED_SUMMARY_EYEBROW,
} from './create-setup.constants'
import {
  buildCreateSetupChoiceSetMap,
  buildCreateSetupPanelItems,
  buildCreateSetupSetMap,
} from './create-setup-panel-items.client'
import {
  resolveCreateSetupActiveSetId,
  resolveCreateSetupCanContinue,
  resolveCreateSetupVisibleSetIds,
} from './create-setup-sequence.lib'
import type { CreateSetupSet } from './create-setup.types'
import { createSetupModalBodyClasses } from './create-setup.variants'

export type CreateSetupPanelProps = {
  sets: CreateSetupSet[]
  changeLabel?: string
  /** Controlled reopen override; omit for uncontrolled (panel owns local state). */
  reopenSetId?: string | null
  onReopenSetIdChange?: (setId: string | null) => void
  /**
   * Declared choice-set ids that collapse into one quiet summary when every
   * listed set is visible, complete, and collapsed. Omitted = ChooserSummaryCard per set.
   */
  groupedChoiceSetIds?: readonly string[]
  groupedSummaryEyebrow?: string
  className?: string
}

/** Ordered setup stack — sequencer + kind-specific controls. */
export function CreateSetupPanel({
  sets,
  changeLabel = CREATE_SETUP_DEFAULT_CHANGE_LABEL,
  reopenSetId: reopenSetIdProp,
  onReopenSetIdChange,
  groupedChoiceSetIds = [],
  groupedSummaryEyebrow = CREATE_SETUP_DEFAULT_GROUPED_SUMMARY_EYEBROW,
  className = createSetupModalBodyClasses,
}: CreateSetupPanelProps) {
  assertCreateSetupSetsOnReset(sets)

  const baseId = useId()
  const [uncontrolledReopenSetId, setUncontrolledReopenSetId] = useState<string | null>(null)
  const isReopenControlled = onReopenSetIdChange != null
  const reopenSetId = isReopenControlled ? (reopenSetIdProp ?? null) : uncontrolledReopenSetId
  const setReopenSetId = isReopenControlled ? onReopenSetIdChange : setUncontrolledReopenSetId

  const sequenceItems = useMemo(
    () =>
      sets.map((set) => ({
        id: set.id,
        isComplete: set.isComplete,
        required: set.required,
        dependsOn: set.dependsOn,
        visibleWhenComplete: set.visibleWhenComplete,
        collapseWhenComplete: set.collapseWhenComplete,
        collapseWhenActiveAndComplete: set.collapseWhenActiveAndComplete,
      })),
    [sets],
  )

  const activeSetId = resolveCreateSetupActiveSetId({
    sets: sequenceItems,
    reopenSetId,
  })

  const visibleSetIds = resolveCreateSetupVisibleSetIds({
    sets: sequenceItems,
    activeSetId,
  })

  const setById = useMemo(() => buildCreateSetupSetMap(sets), [sets])
  const choiceSetById = useMemo(() => buildCreateSetupChoiceSetMap(sets), [sets])

  const panelItems = buildCreateSetupPanelItems({
    baseId,
    visibleSetIds,
    sequenceItems,
    setById,
    choiceSetById,
    activeSetId,
    reopenSetId,
    changeLabel,
    groupedChoiceSetIds,
    groupedSummaryEyebrow,
    setReopenSetId,
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
  onContinue,
  additionalContinueConstraint = true,
}: CreateSetupShellProps) {
  const sequenceItems = useMemo(
    () =>
      sets.map((set) => ({
        id: set.id,
        isComplete: set.isComplete,
        required: set.required,
        dependsOn: set.dependsOn,
        visibleWhenComplete: set.visibleWhenComplete,
        collapseWhenComplete: set.collapseWhenComplete,
        collapseWhenActiveAndComplete: set.collapseWhenActiveAndComplete,
      })),
    [sets],
  )

  const canContinue =
    resolveCreateSetupCanContinue({ sets: sequenceItems }) && additionalContinueConstraint

  const description = typeof subhead === 'string' ? subhead : undefined

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm" {...(!description ? { 'aria-describedby': undefined } : {})}>
        <Modal.Header headline={headline} description={description} />
        <Modal.Body>
          <CreateSetupPanel sets={sets} changeLabel={changeLabel} />
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
