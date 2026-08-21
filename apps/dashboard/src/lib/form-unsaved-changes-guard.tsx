import { useCallback, useContext, useEffect, useRef } from 'react'
import { useFormState } from 'react-hook-form'
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router-dom'

import { useSubclassUnsavedEditsBlocking } from '@/features/content/classes/hooks/subclass-unsaved-edits-context'

import { composeFormLeaveDirty } from './form-leave-dirty'
import {
  useUnsavedChangesConfirm,
  type UnsavedChangesConfirmController,
} from './use-unsaved-changes-confirm'

function useComposedFormDirtyState(extraUnsavedEdits?: boolean) {
  const { dirtyFields } = useFormState()
  const subclassEdits = useSubclassUnsavedEditsBlocking()
  return composeFormLeaveDirty({ dirtyFields, extraUnsavedEdits, subclassEdits })
}

function FormUnsavedChangesRouterAdapterInner({
  discardGuard,
  pending = false,
}: {
  discardGuard: UnsavedChangesConfirmController
  pending?: boolean
}) {
  const isDirtyRef = useRef(discardGuard.isDirty)
  const pendingRef = useRef(pending)
  const discardGuardRef = useRef(discardGuard)

  useEffect(() => {
    isDirtyRef.current = discardGuard.isDirty
    pendingRef.current = pending
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
      return pendingRef.current || isDirtyRef.current
    },
    [],
  )

  const blocker = useBlocker(shouldBlockNavigation)
  const handledBlockRef = useRef(false)

  useEffect(() => {
    if (blocker.state === 'blocked' && !discardGuard.isDirty && !pending) {
      blocker.reset?.()
    }
  }, [blocker, discardGuard.isDirty, pending])

  useEffect(() => {
    if (blocker.state !== 'blocked') {
      handledBlockRef.current = false
      return
    }
    if (handledBlockRef.current) return

    handledBlockRef.current = true

    if (pending) {
      blocker.reset?.()
      return
    }

    discardGuard.request(
      () => blocker.proceed?.(),
      () => blocker.reset?.(),
    )
  }, [blocker, discardGuard, pending])

  return null
}

function FormUnsavedChangesRouterAdapter({
  discardGuard,
  enabled = true,
  pending,
}: {
  discardGuard: UnsavedChangesConfirmController
  enabled?: boolean
  pending?: boolean
}) {
  const dataRouter = useContext(UNSAFE_DataRouterContext)
  if (!dataRouter || !enabled) return null
  return <FormUnsavedChangesRouterAdapterInner discardGuard={discardGuard} pending={pending} />
}

function FormUnsavedChangesGuardInternal({
  extraUnsavedEdits,
  enabled = true,
  renderDialog = true,
  pending,
}: {
  extraUnsavedEdits?: boolean
  enabled?: boolean
  renderDialog?: boolean
  pending?: boolean
}) {
  const composedIsDirty = useComposedFormDirtyState(extraUnsavedEdits)
  const discardGuard = useUnsavedChangesConfirm({ isDirty: composedIsDirty })

  return (
    <>
      {renderDialog ? discardGuard.dialog : null}
      <FormUnsavedChangesRouterAdapter
        discardGuard={discardGuard}
        enabled={enabled}
        pending={pending}
      />
    </>
  )
}

/** Blocks in-app navigation while the surrounding form is dirty; shows ConfirmDialog. */
export function FormUnsavedChangesGuard({
  extraUnsavedEdits,
  discardGuard: externalDiscardGuard,
  enabled = true,
  renderDialog = true,
  pending,
}: {
  /** Additive extras beyond body dirtyFields and subclass edits — never suppresses body dirtiness. */
  extraUnsavedEdits?: boolean
  discardGuard?: UnsavedChangesConfirmController
  enabled?: boolean
  /** When a parent shell already renders `discardGuard.dialog`, pass false. */
  renderDialog?: boolean
  /** When true, blocks navigation without opening the discard dialog. */
  pending?: boolean
} = {}) {
  if (externalDiscardGuard) {
    return (
      <FormUnsavedChangesRouterAdapter
        discardGuard={externalDiscardGuard}
        enabled={enabled}
        pending={pending}
      />
    )
  }

  return (
    <FormUnsavedChangesGuardInternal
      extraUnsavedEdits={extraUnsavedEdits}
      enabled={enabled}
      renderDialog={renderDialog}
      pending={pending}
    />
  )
}

export type { UnsavedChangesConfirmController } from './use-unsaved-changes-confirm'
export { useUnsavedChangesConfirm } from './use-unsaved-changes-confirm'
