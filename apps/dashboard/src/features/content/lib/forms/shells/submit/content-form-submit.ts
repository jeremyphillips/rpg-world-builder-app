import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext, type FieldValues } from 'react-hook-form'
import { isApiError } from '@rpg/contracts/shared'
import {
  cancelPendingInvalidSubmitFocus,
  createEmptyFormValidationProducerSession,
  FormUiContext,
  FormValidationInteractiveProducerBridge,
  FormValidationProducerProvider,
  useSubmitHandler,
  type FormIssue,
  type FormValidationProducerSession,
  type FormValidationProducerSlot,
  type UseSubmitHandlerResult,
} from '@rpg/ui/form'

import { resolveContentFormSchema, resolveContentPublishSchema } from '../edit/content-edit-load'
import { ingestContentFormValidationIssues } from '../../validation/ingest-content-form-validation.lib'
import { runContentFormCommitAttempt } from './content-form-submit-commit.lib'
import {
  ContentFormSubmitSuperseded,
  ContentFormSubmitValidationFailed,
  type ContentFormInvalidPresentation,
  type UseContentFormSubmitOptions,
} from './content-form-submit-types.lib'

export {
  ContentFormSubmitSuperseded,
  ContentFormSubmitValidationFailed,
  type ContentFormInvalidPresentation,
  type UseContentFormSubmitOptions,
} from './content-form-submit-types.lib'
export { presentContentFormInvalidSubmit } from './content-form-submit-presentation.lib'
export { focusFormPath } from './content-form-editor-focus.lib'
export {
  useContentFormSubmitProducerBinding,
  type ContentFormSubmitProducerBinding,
} from './content-form-submit-producer-binding.client'

export type UseContentFormSubmitResult<TValues extends FieldValues> =
  UseSubmitHandlerResult<TValues> & {
    /** Stamp watch only — use when a second submit hook shares one form boundary. */
    ProducerStampBridge: () => null
    /** Wraps field chrome so presentation reads the producer session. */
    ProducerBoundary: React.ComponentType<{ children: React.ReactNode }>
    /** @deprecated Prefer {@link ProducerBoundary} + {@link ProducerStampBridge}. */
    UiBridge: () => null
  }

export function useContentFormSubmit<TValues extends FieldValues>(
  options: UseContentFormSubmitOptions<TValues>,
): UseContentFormSubmitResult<TValues> {
  const {
    def,
    ctx,
    commitValidationIntent = 'publish',
    fallbackMessage,
    mapError,
    invalidPresentation,
    prepareCommitValues,
    writeSchema,
    prepareWrite,
    persist,
    producerBinding,
    mountProducerChrome = true,
  } = options

  const attemptCounterRef = useRef(0)
  const internalStampRef = useRef(0)
  const internalPersistingRef = useRef(0)
  const internalUiRef = useRef<Pick<
    import('@rpg/ui/form').FormUiContextValue,
    'markSubmitAttempted' | 'markPublishAttempted' | 'addValidationSessionExpandKeys'
  > | null>(null)

  const stampRef = producerBinding?.stampRef ?? internalStampRef
  const persistingRef = producerBinding?.persistingRef ?? internalPersistingRef
  const uiRef = producerBinding?.uiRef ?? internalUiRef

  const [ownedSession, setOwnedSession] = useState<FormValidationProducerSession>(() =>
    createEmptyFormValidationProducerSession(),
  )
  const [ownedSnapshotStamp, setOwnedSnapshotStamp] = useState(0)

  const producerSession = producerBinding?.producerSession ?? ownedSession
  const setProducerSession = producerBinding?.setProducerSession ?? setOwnedSession
  const snapshotStamp = producerBinding?.snapshotStamp ?? ownedSnapshotStamp
  const setSnapshotStamp = producerBinding?.setSnapshotStamp ?? setOwnedSnapshotStamp

  const publishSchema =
    commitValidationIntent === 'publish'
      ? resolveContentPublishSchema(def, ctx)
      : resolveContentFormSchema(def, ctx, commitValidationIntent)

  const producerSlot =
    commitValidationIntent === 'publish' ? ('publish-action' as const) : ('draft-action' as const)

  const { onSubmit, formError } = useSubmitHandler<TValues>({
    fallbackMessage,
    mapError: (error) => {
      if (
        error instanceof ContentFormSubmitValidationFailed ||
        error instanceof ContentFormSubmitSuperseded
      ) {
        return null
      }
      const mapped = mapError?.(error)
      if (mapped !== undefined) return mapped
      // Server-authored API copy is safe; any other throw (Zod, invariant) is not author copy.
      return isApiError(error) ? error.message : fallbackMessage
    },
    submit: async (values, form) => {
      cancelPendingInvalidSubmitFocus()
      // Captured synchronously, before the first await.
      const attemptId = ++attemptCounterRef.current
      const attempt = { stamp: stampRef.current, attemptId }
      const readCurrent = () => ({
        stamp: stampRef.current,
        attemptId: attemptCounterRef.current,
      })
      const result = await runContentFormCommitAttempt({
        values,
        form,
        publishSchema,
        writeSchema,
        resolverFields: invalidPresentation?.resolverFields ?? [],
        producerSlot,
        commitValidationIntent,
        prepareCommitValues,
        prepareWrite,
        attempt,
        readCurrent,
        invalidPresentation,
        ui: uiRef.current,
        producerSession,
        persist: async (wireValues, persistForm) => {
          persistingRef.current += 1
          try {
            await persist(wireValues, persistForm)
          } finally {
            persistingRef.current -= 1
          }
        },
      })

      if (result.kind === 'superseded') throw new ContentFormSubmitSuperseded()
      setProducerSession(result.session)
      if (result.kind === 'validation-blocked') {
        throw new ContentFormSubmitValidationFailed()
      }
      if (result.kind === 'persist-failed') {
        throw result.error
      }
    },
  })

  const replaceSlot = useCallback(
    (slot: FormValidationProducerSlot, issues: readonly FormIssue[]) => {
      setProducerSession((prev) =>
        ingestContentFormValidationIssues(prev, slot, stampRef.current, issues),
      )
    },
    [],
  )

  function useContentFormSubmitStampWatch() {
    const ui = useContext(FormUiContext)
    uiRef.current = ui
    const rhf = useFormContext()
    useEffect(() => {
      if (!rhf) return
      const subscription = rhf.watch((_values, info) => {
        // A pathless event is a reset. The attempt's own save boundary resets from the
        // response while persisting; that must not supersede the attempt itself.
        if (info.name === undefined && persistingRef.current > 0) return
        stampRef.current += 1
        setSnapshotStamp(stampRef.current)
      })
      return () => subscription.unsubscribe()
    }, [rhf])
  }

  function ProducerStampBridge() {
    if (!mountProducerChrome) return null
    return React.createElement(ProducerStampBridgeActive)
  }

  function ProducerStampBridgeActive() {
    useContentFormSubmitStampWatch()
    return null
  }

  function ProducerBoundary({ children }: { children: React.ReactNode }) {
    if (!mountProducerChrome) return React.createElement(React.Fragment, null, children)
    return React.createElement(ProducerBoundaryActive, { children })
  }

  function ProducerBoundaryActive({ children }: { children: React.ReactNode }) {
    useContentFormSubmitStampWatch()
    const value = useMemo(
      () => ({ session: producerSession, stamp: snapshotStamp, replaceSlot }),
      [replaceSlot, producerSession, snapshotStamp],
    )
    return React.createElement(
      FormValidationProducerProvider,
      { ...value },
      React.createElement(FormValidationInteractiveProducerBridge, {
        fields: invalidPresentation?.resolverFields ?? [],
      }),
      children,
    )
  }

  /** @deprecated Use {@link ProducerBoundary} around field chrome. */
  function UiBridge() {
    return React.createElement(ProducerStampBridge)
  }

  return { onSubmit, formError, ProducerBoundary, ProducerStampBridge, UiBridge }
}
