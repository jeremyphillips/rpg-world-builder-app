import { useCallback, useContext, useEffect, useRef } from 'react'
import { useFormState } from 'react-hook-form'
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router-dom'

import { useSubclassUnsavedEditsBlocking } from '@/features/content/classes/hooks/subclass-unsaved-edits-context.client'

import { hasDirtyFields } from './form-dirty-state'
import {
  useUnsavedChangesConfirm,
  type UnsavedChangesConfirmController,
} from './use-unsaved-changes-confirm'

function useComposedFormDirtyState(extraUnsavedEdits?: boolean) {
  const { dirtyFields } = useFormState()
  const subclassEdits = useSubclassUnsavedEditsBlocking()
  return hasDirtyFields(dirtyFields) || subclassEdits || Boolean(extraUnsavedEdits)
}

function FormUnsavedChangesRouterAdapterInner({
  discardGuard,
}: {
  discardGuard: UnsavedChangesConfirmController
}) {
  const isDirtyRef = useRef(discardGuard.isDirty)
  const discardGuardRef = useRef(discardGuard)

  useEffect(() => {
    isDirtyRef.current = discardGuard.isDirty
    discardGuardRef.current = discardGuard
  })

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
      if (discardGuardRef.current.consumeTrustedBypass()) {
        return false
      }
      return isDirtyRef.current
    },
    [],
  )

  const blocker = useBlocker(shouldBlockNavigation)
  const handledBlockRef = useRef(false)

  useEffect(() => {
    if (blocker.state === 'blocked' && !discardGuard.isDirty) {
      blocker.reset?.()
    }
  }, [blocker, discardGuard.isDirty])

  useEffect(() => {
    if (blocker.state !== 'blocked') {
      handledBlockRef.current = false
      return
    }
    if (handledBlockRef.current) return

    handledBlockRef.current = true
    discardGuard.request(
      () => blocker.proceed?.(),
      () => blocker.reset?.(),
    )
  }, [blocker, discardGuard])

  return null
}

function FormUnsavedChangesRouterAdapter({
  discardGuard,
  enabled = true,
}: {
  discardGuard: UnsavedChangesConfirmController
  enabled?: boolean
}) {
  const dataRouter = useContext(UNSAFE_DataRouterContext)
  if (!dataRouter || !enabled) return null
  return <FormUnsavedChangesRouterAdapterInner discardGuard={discardGuard} />
}

/** Blocks in-app navigation while the surrounding form is dirty; shows ConfirmDialog. */
export function FormUnsavedChangesGuard({
  extraUnsavedEdits,
  discardGuard: externalDiscardGuard,
  enabled = true,
  renderDialog = true,
}: {
  /** Additive extras beyond body dirtyFields and subclass edits — never suppresses body dirtiness. */
  extraUnsavedEdits?: boolean
  discardGuard?: UnsavedChangesConfirmController
  enabled?: boolean
  /** When a parent shell already renders `discardGuard.dialog`, pass false. */
  renderDialog?: boolean
} = {}) {
  const composedIsDirty = useComposedFormDirtyState(extraUnsavedEdits)
  const internalDiscardGuard = useUnsavedChangesConfirm({ isDirty: composedIsDirty })
  const discardGuard = externalDiscardGuard ?? internalDiscardGuard

  return (
    <>
      {renderDialog && !externalDiscardGuard ? internalDiscardGuard.dialog : null}
      <FormUnsavedChangesRouterAdapter discardGuard={discardGuard} enabled={enabled} />
    </>
  )
}

export type { UnsavedChangesConfirmController } from './use-unsaved-changes-confirm'
export { useUnsavedChangesConfirm } from './use-unsaved-changes-confirm'
