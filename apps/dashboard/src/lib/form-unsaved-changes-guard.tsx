import { useCallback, useEffect, useRef } from 'react'
import { useFormState } from 'react-hook-form'
import { useBlocker } from 'react-router-dom'
import { ConfirmDialog } from '@rpg/ui'

import { useSubclassUnsavedEditsBlocking } from '@/features/content/classes/hooks/subclass-unsaved-edits-context.client'

const DISCARD_CHANGES_HEADLINE = 'Discard changes?'
const DISCARD_CHANGES_DESCRIPTION = 'You have unsaved changes. Leaving now will lose them.'
const DISCARD_CHANGES_CONFIRM_LABEL = 'Discard'
const DISCARD_CHANGES_CANCEL_LABEL = 'Keep editing'

/** Set by successful save handlers before programmatic navigation. */
const allowNavigationOnceRef = { current: false }

/** Skip the next blocked navigation — call after `form.reset` when leaving post-save. */
export function allowFormNavigationOnce() {
  allowNavigationOnceRef.current = true
}

/** True when the user has edited at least one registered field. */
function hasDirtyFields(dirtyFields: Record<string, unknown>): boolean {
  return Object.values(dirtyFields).some((value) => {
    if (value === true) return true
    if (value && typeof value === 'object') {
      return hasDirtyFields(value as Record<string, unknown>)
    }
    return false
  })
}

/** Blocks in-app navigation while the surrounding form is dirty; shows ConfirmDialog. */
export function FormUnsavedChangesGuard() {
  const { dirtyFields } = useFormState()
  const subclassEdits = useSubclassUnsavedEditsBlocking()
  const hasUnsavedChanges = hasDirtyFields(dirtyFields) || subclassEdits
  const unsavedRef = useRef(hasUnsavedChanges)
  unsavedRef.current = hasUnsavedChanges

  const shouldBlockNavigation = useCallback(
    ({
      currentLocation,
      nextLocation,
    }: {
      currentLocation: { pathname: string; search: string }
      nextLocation: { pathname: string; search: string }
    }) => {
      if (
        currentLocation.pathname === nextLocation.pathname &&
        currentLocation.search === nextLocation.search
      ) {
        return false
      }
      if (allowNavigationOnceRef.current) {
        allowNavigationOnceRef.current = false
        return false
      }
      return unsavedRef.current
    },
    [],
  )

  const blocker = useBlocker(shouldBlockNavigation)
  const proceedRef = useRef(false)

  useEffect(() => {
    if (blocker.state === 'blocked' && !hasUnsavedChanges) {
      blocker.reset?.()
    }
  }, [blocker, hasUnsavedChanges])

  const handleConfirm = useCallback(() => {
    proceedRef.current = true
    blocker.proceed?.()
  }, [blocker])

  const handleCancel = useCallback(() => {
    blocker.reset?.()
  }, [blocker])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) return
      if (proceedRef.current) {
        proceedRef.current = false
        return
      }
      blocker.reset?.()
    },
    [blocker],
  )

  return (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      onOpenChange={handleOpenChange}
      headline={DISCARD_CHANGES_HEADLINE}
      description={DISCARD_CHANGES_DESCRIPTION}
      confirmLabel={DISCARD_CHANGES_CONFIRM_LABEL}
      cancelLabel={DISCARD_CHANGES_CANCEL_LABEL}
      confirmVariant="destructive"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )
}
