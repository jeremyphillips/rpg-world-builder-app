import { useContext, useRef } from 'react'
import type { FieldValues } from 'react-hook-form'
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
  ContentFormSubmitValidationFailed,
  type ContentFormInvalidPresentation,
  type UseContentFormSubmitOptions,
} from './content-form-submit-types.lib'

export {
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
    attemptStamp,
    persist,
  } = options

  const uiRef = useRef<Pick<
    import('@rpg/ui/form').FormUiContextValue,
    'markSubmitAttempted' | 'markPublishAttempted' | 'addValidationSessionExpandKeys'
  > | null>(null)

  const producerSessionRef = useRef<FormValidationProducerSession>(
    createEmptyFormValidationProducerSession(),
  )

  const publishSchema =
    commitValidationIntent === 'publish'
      ? resolveContentPublishSchema(def, ctx)
      : resolveContentFormSchema(def, ctx, commitValidationIntent)

  const producerSlot =
    commitValidationIntent === 'publish' ? ('publish-action' as const) : ('draft-action' as const)

  const { onSubmit, formError } = useSubmitHandler<TValues>({
    fallbackMessage,
    mapError: (error) => {
      if (error instanceof ContentFormSubmitValidationFailed) return null
      return mapError?.(error)
    },
    submit: async (values, form) => {
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
        attemptStamp,
        invalidPresentation,
        ui: uiRef.current,
        producerSession: producerSessionRef.current,
        persist,
      })

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
    return null
  }

  return { onSubmit, formError, UiBridge }
}
