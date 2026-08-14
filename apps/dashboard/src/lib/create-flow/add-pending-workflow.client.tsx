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
  onAddAnother: () => void
  pendingHeading?: string
  pendingItems: React.ReactNode
  composing?: React.ReactNode
}

export function AddPendingWorkflow({
  hasPendingItems,
  mode,
  defaultMode,
  onModeChange,
  addAnotherLabel,
  onAddAnother,
  pendingHeading,
  pendingItems,
  composing,
}: AddPendingWorkflowProps) {
  const [uncontrolledMode, setUncontrolledMode] = React.useState<AddPendingWorkflowMode>(
    defaultMode ?? (hasPendingItems ? 'pending' : 'add'),
  )
  const requestedMode = mode ?? uncontrolledMode
  const resolvedMode = resolveAddPendingMode({ requestedMode, hasPendingItems })

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

  return (
    <div className={addPendingWorkflowStackClasses} data-add-pending-mode={resolvedMode}>
      {resolvedMode === 'pending' ? (
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
        composing
      )}
    </div>
  )
}
