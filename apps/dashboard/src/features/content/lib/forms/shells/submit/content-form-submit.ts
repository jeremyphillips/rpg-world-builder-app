import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext, type FieldValues } from 'react-hook-form'
import { getApiValidationIssues } from '@rpg/contracts'
import { isApiError } from '@rpg/contracts/shared'
import {
  cancelPendingInvalidSubmitFocus,
  createEmptyFormValidationProducerSession,
  FormUiContext,
  FormValidationInteractiveProducerBridge,
  FormValidationProducerProvider,
  useSubmitHandler,
  type FormIssue,
  type FormItem,
  type FormValidationProducerSession,
  type FormValidationProducerSlot,
  type UseSubmitHandlerResult,
} from '@rpg/ui/form'

import { resolveContentFormSchema, resolveContentPublishSchema } from '../edit/content-edit-load'
import {
  ingestContentFormValidationIssues,
  realignFormValidationProducerSessionStamps,
} from '../../validation/ingest-content-form-validation.lib'
import { consumeContentFormPersistBaselineReset } from './content-form-persist-baseline-reset.lib'
import { runContentFormCommitAttempt } from './content-form-submit-commit.lib'
import {
  ContentFormSubmitSuperseded,
  ContentFormSubmitValidationFailed,
  type UseContentFormSubmitOptions,
} from './content-form-submit-types.lib'

const EMPTY_RESOLVER_FIELDS: FormItem[] = []

export {
  ContentFormSubmitSuperseded,
  ContentFormSubmitValidationFailed,
  type ContentFormInvalidPresentation,
  type UseContentFormSubmitOptions,
} from './content-form-submit-types.lib'
export { presentContentFormInvalidSubmit } from './content-form-submit-presentation.lib'
export {
  useContentFormSubmitProducerBinding,
  type ContentFormSubmitProducerBinding,
} from './content-form-submit-producer-binding.client'

export type UseContentFormSubmitResult<TValues extends FieldValues> =
  UseSubmitHandlerResult<TValues> & {
    /** Stamp watch only — use when a second submit hook shares one form boundary. */
    ProducerStampBridge: () => React.ReactNode
    /** Wraps field chrome so presentation reads the producer session. */
    ProducerBoundary: React.ComponentType<{ children: React.ReactNode }>
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
  const stampWatchLeasesRef = useRef(0)
  const stampWatchCleanupRef = useRef<(() => void) | null>(null)
  const internalPersistingRef = useRef(0)
  const persistValuesSnapshotRef = useRef<string | null>(null)
  const persistSupersededRef = useRef(false)
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

  const interactiveResolverFields = useMemo(
    () => invalidPresentation?.resolverFields ?? EMPTY_RESOLVER_FIELDS,
    [invalidPresentation?.resolverFields],
  )

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
      if (isApiError(error) && getApiValidationIssues(error)?.length) {
        return null
      }
      // Server-authored API copy is safe when there are no field issues; any other throw is not author copy.
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
      const isCurrent = () => {
        const current = readCurrent()
        return current.stamp === attempt.stamp && current.attemptId === attempt.attemptId
      }
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
        persistSupersededRef,
        persist: async (wireValues, persistForm) => {
          persistingRef.current += 1
          persistSupersededRef.current = false
          persistValuesSnapshotRef.current = JSON.stringify(persistForm.getValues())
          const persistMeta = { isAttemptCurrent: isCurrent }
          try {
            await persist(wireValues, persistForm, persistMeta)
          } finally {
            persistingRef.current -= 1
            persistValuesSnapshotRef.current = null
          }
        },
      })

      if (result.kind === 'superseded') throw new ContentFormSubmitSuperseded()
      setProducerSession(
        realignFormValidationProducerSessionStamps(result.session, stampRef.current),
      )
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
      stampWatchLeasesRef.current += 1
      if (stampWatchLeasesRef.current === 1) {
        const subscription = rhf.watch((_values, info) => {
          if (persistingRef.current > 0) {
            if (info.name === undefined && consumeContentFormPersistBaselineReset(rhf)) return
            const snapshot = persistValuesSnapshotRef.current
            const shouldBumpForWholeForm =
              info.name === undefined &&
              snapshot !== null &&
              JSON.stringify(rhf.getValues()) !== snapshot
            const shouldBumpForField = info.name !== undefined
            if (shouldBumpForWholeForm || shouldBumpForField) {
              persistSupersededRef.current = true
              stampRef.current += 1
              setSnapshotStamp(stampRef.current)
              if (shouldBumpForWholeForm && snapshot !== null) {
                persistValuesSnapshotRef.current = JSON.stringify(rhf.getValues())
              }
            }
            return
          }
          stampRef.current += 1
          setSnapshotStamp(stampRef.current)
        })
        stampWatchCleanupRef.current = () => subscription.unsubscribe()
      }
      return () => {
        stampWatchLeasesRef.current -= 1
        if (stampWatchLeasesRef.current === 0) {
          stampWatchCleanupRef.current?.()
          stampWatchCleanupRef.current = null
        }
      }
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
    return React.createElement(FormValidationProducerProvider, {
      ...value,
      children: React.createElement(
        React.Fragment,
        null,
        React.createElement(FormValidationInteractiveProducerBridge, {
          fields: interactiveResolverFields,
        }),
        children,
      ),
    })
  }

  return { onSubmit, formError, ProducerBoundary, ProducerStampBridge }
}
