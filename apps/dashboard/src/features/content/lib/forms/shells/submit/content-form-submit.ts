import { useContext, useEffect, useRef } from 'react'
import { useFormContext, type FieldValues } from 'react-hook-form'
import { isApiError } from '@rpg/contracts/shared'
import {
  createEmptyFormValidationProducerSession,
  FormUiContext,
  useSubmitHandler,
  type FormValidationProducerSession,
  type UseSubmitHandlerResult,
} from '@rpg/ui/form'

import { resolveContentFormSchema, resolveContentPublishSchema } from '../edit/content-edit-load'
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
export {
  presentContentFormInvalidSubmit,
  focusFormPath,
} from './content-form-submit-presentation.lib'

export type UseContentFormSubmitResult<TValues extends FieldValues> =
  UseSubmitHandlerResult<TValues> & {
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
  } = options

  const uiRef = useRef<Pick<
    import('@rpg/ui/form').FormUiContextValue,
    'markSubmitAttempted' | 'markPublishAttempted' | 'addValidationSessionExpandKeys'
  > | null>(null)

  const producerSessionRef = useRef<FormValidationProducerSession>(
    createEmptyFormValidationProducerSession(),
  )

  // Snapshot stamp: bumped by UiBridge on authored value change or reset, never on UI state.
  const stampRef = useRef(0)
  const persistingRef = useRef(0)
  const attemptCounterRef = useRef(0)

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
        producerSession: producerSessionRef.current,
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
      producerSessionRef.current = result.session
      if (result.kind === 'validation-blocked') {
        throw new ContentFormSubmitValidationFailed()
      }
      if (result.kind === 'persist-failed') {
        throw result.error
      }
    },
  })

  function UiBridge() {
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
      })
      return () => subscription.unsubscribe()
    }, [rhf])
    return null
  }

  return { onSubmit, formError, UiBridge }
}
