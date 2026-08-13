'use client'

import * as React from 'react'
import { Button, Heading } from '@rpg/ui'

import { resolveAddPendingMode, type AddPendingWorkflowMode } from './add-pending-workflow.lib'
import {
  addPendingWorkflowDiscoveryListClasses,
  addPendingWorkflowPendingListClasses,
  addPendingWorkflowStackClasses,
} from './add-pending-workflow.variants'

export type { AddPendingWorkflowMode }

export type AddPendingDisclosureContextValue = Readonly<{
  expandedItemId: string | null
  expandItem: (itemId: string) => void
  collapseItem: () => void
}>

const AddPendingDisclosureContext = React.createContext<AddPendingDisclosureContextValue | null>(
  null,
)

export function useAddPendingDisclosure(): AddPendingDisclosureContextValue | null {
  return React.useContext(AddPendingDisclosureContext)
}

export type AddPendingWorkflowProps = {
  hasPendingItems: boolean
  mode?: AddPendingWorkflowMode
  defaultMode?: AddPendingWorkflowMode
  onModeChange?: (mode: AddPendingWorkflowMode) => void
  expandedItemId?: string | null
  defaultExpandedItemId?: string | null
  onExpandedItemIdChange?: (itemId: string | null) => void
  addAnotherLabel: string
  onAddAnother: () => void
  pendingHeading?: string
  pendingItems: React.ReactNode
  addDescription?: React.ReactNode
  addSearch?: React.ReactNode
  addDiscovery: React.ReactNode
  addAlternateAction?: React.ReactNode
  addBranch?: React.ReactNode
  addBranchBackLabel?: string
  onAddBranchBack?: () => void
}

export function AddPendingWorkflow({
  hasPendingItems,
  mode,
  defaultMode,
  onModeChange,
  expandedItemId,
  defaultExpandedItemId = null,
  onExpandedItemIdChange,
  addAnotherLabel,
  onAddAnother,
  pendingHeading,
  pendingItems,
  addDescription,
  addSearch,
  addDiscovery,
  addAlternateAction,
  addBranch,
  addBranchBackLabel,
  onAddBranchBack,
}: AddPendingWorkflowProps) {
  const [uncontrolledMode, setUncontrolledMode] = React.useState<AddPendingWorkflowMode>(
    defaultMode ?? (hasPendingItems ? 'pending' : 'add'),
  )
  const [uncontrolledExpandedItemId, setUncontrolledExpandedItemId] = React.useState<string | null>(
    defaultExpandedItemId,
  )
  const requestedMode = mode ?? uncontrolledMode
  const resolvedMode = resolveAddPendingMode({ requestedMode, hasPendingItems })
  const resolvedExpandedItemId = expandedItemId ?? uncontrolledExpandedItemId

  const setRequestedMode = React.useCallback(
    (nextMode: AddPendingWorkflowMode) => {
      if (mode === undefined) setUncontrolledMode(nextMode)
      onModeChange?.(nextMode)
    },
    [mode, onModeChange],
  )

  const setExpandedItemId = React.useCallback(
    (itemId: string | null) => {
      if (expandedItemId === undefined) setUncontrolledExpandedItemId(itemId)
      onExpandedItemIdChange?.(itemId)
    },
    [expandedItemId, onExpandedItemIdChange],
  )

  const handleAddAnother = React.useCallback(() => {
    setRequestedMode('add')
    setExpandedItemId(null)
    onAddAnother()
  }, [onAddAnother, setExpandedItemId, setRequestedMode])

  const handleAddBranchBack = React.useCallback(() => {
    setExpandedItemId(null)
    onAddBranchBack?.()
  }, [onAddBranchBack, setExpandedItemId])

  const disclosure = React.useMemo<AddPendingDisclosureContextValue>(
    () => ({
      expandedItemId: resolvedExpandedItemId,
      expandItem: (itemId) => setExpandedItemId(itemId),
      collapseItem: () => setExpandedItemId(null),
    }),
    [resolvedExpandedItemId, setExpandedItemId],
  )

  return (
    <AddPendingDisclosureContext.Provider value={disclosure}>
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
        ) : addBranch ? (
          <>
            {addBranchBackLabel ? (
              <div>
                <Button type="button" variant="ghost" onClick={handleAddBranchBack}>
                  {addBranchBackLabel}
                </Button>
              </div>
            ) : null}
            {addBranch}
          </>
        ) : (
          <>
            {addDescription}
            {addSearch}
            <div className={addPendingWorkflowDiscoveryListClasses}>{addDiscovery}</div>
            {addAlternateAction}
          </>
        )}
      </div>
    </AddPendingDisclosureContext.Provider>
  )
}
