'use client'

import * as React from 'react'
import { Button, Heading } from '@rpg/ui'

import { resolveAddPendingMode, type AddPendingWorkflowMode } from './add-pending-workflow.lib'
import {
  addPendingWorkflowPendingListClasses,
  addPendingWorkflowStackClasses,
} from './add-pending-workflow.variants'

export type { AddPendingWorkflowMode }

export type AddPendingWorkflowProps = {
  hasPendingItems: boolean
  mode?: AddPendingWorkflowMode
  defaultMode?: AddPendingWorkflowMode
  onModeChange?: (mode: AddPendingWorkflowMode) => void
  addAnotherLabel: string
  addFirstLabel?: string
  onAddAnother: () => void
  pendingHeading?: string
  pendingItems: React.ReactNode
  emptyState?: React.ReactNode
  composing?: React.ReactNode
}

export function AddPendingWorkflow({
  hasPendingItems,
  mode,
  defaultMode,
  onModeChange,
  addAnotherLabel,
  addFirstLabel,
  onAddAnother,
  pendingHeading,
  pendingItems,
  emptyState,
  composing,
}: AddPendingWorkflowProps) {
  const allowEmptyResting = emptyState != null
  const [uncontrolledMode, setUncontrolledMode] = React.useState<AddPendingWorkflowMode>(
    defaultMode ?? (hasPendingItems || allowEmptyResting ? 'pending' : 'add'),
  )
  const requestedMode = mode ?? uncontrolledMode
  const resolvedMode = resolveAddPendingMode({
    requestedMode,
    hasPendingItems,
    allowEmptyResting,
  })

  const setRequestedMode = React.useCallback(
    (nextMode: AddPendingWorkflowMode) => {
      if (mode === undefined) setUncontrolledMode(nextMode)
      onModeChange?.(nextMode)
    },
    [mode, onModeChange],
  )

  const handleAddAnother = React.useCallback(() => {
    setRequestedMode('add')
    onAddAnother()
  }, [onAddAnother, setRequestedMode])

  const addLabel = hasPendingItems ? addAnotherLabel : (addFirstLabel ?? addAnotherLabel)

  return (
    <div className={addPendingWorkflowStackClasses} data-add-pending-mode={resolvedMode}>
      {resolvedMode === 'pending' ? (
        hasPendingItems ? (
          <>
            <div className={addPendingWorkflowPendingListClasses}>
              {pendingHeading ? (
                <Heading as="h3" variant="subsection">
                  {pendingHeading}
                </Heading>
              ) : null}
              {pendingItems}
            </div>
            <div>
              <Button type="button" variant="ghost" onClick={handleAddAnother}>
                {addAnotherLabel}
              </Button>
            </div>
          </>
        ) : (
          <>
            {emptyState}
            <div>
              <Button type="button" variant="ghost" onClick={handleAddAnother}>
                {addLabel}
              </Button>
            </div>
          </>
        )
      ) : (
        composing
      )}
    </div>
  )
}
