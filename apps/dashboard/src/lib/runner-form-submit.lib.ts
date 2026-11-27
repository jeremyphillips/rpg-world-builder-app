import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext, type FieldValues } from 'react-hook-form'
import { getApiValidationIssues } from '@rpg/contracts'
import { isApiError } from '@rpg/contracts/shared'
import type { ZodType } from 'zod'
import {
  cancelPendingInvalidSubmitFocus,
  createEmptyFormValidationProducerSession,
  FormUiContext,
  FormValidationInteractiveProducerBridge,
  FormValidationProducerProvider,
  useSubmitHandler,
  type FormItem,
  type FormSubmitHandler,
  type FormValidationProducerSession,
  type FormValidationProducerSlot,
  type MapFormError,
} from '@rpg/ui/form'

import { runContentFormCommitAttempt } from '@/features/content/lib/forms/shells/submit/content-form-submit-commit.lib'
import {
  ContentFormSubmitSuperseded,
  ContentFormSubmitValidationFailed,
} from '@/features/content/lib/forms/shells/submit/content-form-submit-types.lib'
import { consumeContentFormPersistBaselineReset } from '@/features/content/lib/forms/shells/submit/content-form-persist-baseline-reset.lib'
import {
  ingestContentFormValidationIssues,
  realignFormValidationProducerSessionStamps,
} from '@/features/content/lib/forms/validation/ingest-content-form-validation.lib'

const EMPTY_RESOLVER_FIELDS: FormItem[] = []

export type RunnerFormInvalidPresentation = {
  resolverFields: FormItem[]
  formId: string
  resolveViewForPath?: (path: string) => string | undefined
  activateView?: (viewId: string) => void
}

export type UseRunnerFormSubmitOptions<TValues extends FieldValues> = {
  schema: ZodType<TValues>
  resolverFields?: FormItem[]
  invalidPresentation?: RunnerFormInvalidPresentation
  fallbackMessage: string
  mapError?: MapFormError
  producerSlot?: FormValidationProducerSlot
  prepareCommitValues?: (values: TValues) => TValues
  persist: FormSubmitHandler<TValues>
  formId?: string
  mountProducerChrome?: boolean
}

export type UseRunnerFormSubmitResult<TValues extends FieldValues> = {
  onSubmit: FormSubmitHandler<TValues>
  formError: string | undefined
  ProducerStampBridge: () => React.ReactNode
  ProducerBoundary: React.ComponentType<{ children: React.ReactNode }>
}

/**
 * Tabbed and flat dashboard forms outside ContentFormDef: evaluate once, run the shared
 * commit runner, and publish canonical issues through the producer session.
 */
export function useRunnerFormSubmit<TValues extends FieldValues>(
  options: UseRunnerFormSubmitOptions<TValues>,
): UseRunnerFormSubmitResult<TValues> {
  const {
    schema,
    resolverFields = EMPTY_RESOLVER_FIELDS,
    invalidPresentation,
    fallbackMessage,
    mapError,
    producerSlot = 'draft-action',
    prepareCommitValues,
    persist,
    formId = 'form',
    mountProducerChrome = true,
  } = options

  const attemptCounterRef = useRef(0)
  const stampRef = useRef(0)
  const stampWatchLeasesRef = useRef(0)
  const stampWatchCleanupRef = useRef<(() => void) | null>(null)
  const persistingRef = useRef(0)
  const persistValuesSnapshotRef = useRef<string | null>(null)
  const persistSupersededRef = useRef(false)
  const uiRef = useRef<Pick<
    import('@rpg/ui/form').FormUiContextValue,
    'markSubmitAttempted' | 'markPublishAttempted' | 'addValidationSessionExpandKeys'
  > | null>(null)

  const [producerSession, setProducerSession] = useState<FormValidationProducerSession>(() =>
    createEmptyFormValidationProducerSession(),
  )
  const [snapshotStamp, setSnapshotStamp] = useState(0)

  const interactiveResolverFields = useMemo(
    () => invalidPresentation?.resolverFields ?? resolverFields,
    [invalidPresentation?.resolverFields, resolverFields],
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
      return isApiError(error) ? error.message : fallbackMessage
    },
    submit: async (values, form) => {
      cancelPendingInvalidSubmitFocus()
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

      const presentation = invalidPresentation ?? {
        resolverFields,
        formId,
      }

      const result = await runContentFormCommitAttempt({
        values,
        form,
        publishSchema: schema,
        resolverFields: presentation.resolverFields,
        producerSlot,
        commitValidationIntent: 'draft',
        prepareCommitValues,
        attempt,
        readCurrent,
        invalidPresentation: presentation,
        ui: uiRef.current,
        producerSession,
        persistSupersededRef,
        persist: async (wireValues, persistForm) => {
          persistingRef.current += 1
          persistSupersededRef.current = false
          persistValuesSnapshotRef.current = JSON.stringify(persistForm.getValues())
          try {
            await persist(wireValues, persistForm)
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
        if (!isCurrent()) throw new ContentFormSubmitSuperseded()
        throw result.error
      }
    },
  })

  const replaceSlot = useCallback(
    (slot: FormValidationProducerSlot, issues: readonly import('@rpg/ui/form').FormIssue[]) => {
      setProducerSession((prev) =>
        ingestContentFormValidationIssues(prev, slot, stampRef.current, issues),
      )
    },
    [],
  )

  function useRunnerFormSubmitStampWatch() {
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
    useRunnerFormSubmitStampWatch()
    return null
  }

  function ProducerBoundary({ children }: { children: React.ReactNode }) {
    if (!mountProducerChrome) return React.createElement(React.Fragment, null, children)
    return React.createElement(ProducerBoundaryActive, { children })
  }

  function ProducerBoundaryActive({ children }: { children: React.ReactNode }) {
    useRunnerFormSubmitStampWatch()
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
