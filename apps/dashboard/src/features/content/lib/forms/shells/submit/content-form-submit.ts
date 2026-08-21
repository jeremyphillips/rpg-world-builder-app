import { useContext, useRef } from 'react'
import type { ContentValidationIntent } from '@rpg/contracts'
import { getApiValidationIssues } from '@rpg/contracts'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import {
  FormUiContext,
  navigateInvalidSubmit,
  resolveInvalidSubmitNavigation,
  useSubmitHandler,
  type FormItem,
  type FormSubmitHandler,
  type FormUiContextValue,
  type UseSubmitHandlerResult,
} from '@rpg/ui/form'

import {
  applyValidationIssuesToForm,
  zodIssuesToValidationIssues,
} from '../../validation/content-publish-validation.lib'
import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'
import { resolveContentFormSchema } from '../edit/content-edit-load'

/** Internal sentinel — commit validation failed after field errors were applied. */
export class ContentFormSubmitValidationFailed extends Error {
  constructor() {
    super('Content form commit validation failed.')
    this.name = 'ContentFormSubmitValidationFailed'
  }
}

export type ContentFormInvalidPresentation = {
  /** Fields for invalid-submit focus (include hoisted identity/name). */
  resolverFields: FormItem[]
  formId: string
  /** Feature-owned: which view/tab owns a failing path. Shared code never hard-codes tab ids. */
  resolveViewForPath?: (path: string) => string | undefined
  activateView?: (viewId: string) => void
}

export type UseContentFormSubmitOptions<TValues extends FieldValues> = {
  def: AnyContentFormDef
  ctx: ContentFormCtx
  /** Final commit intent — default `'publish'`. */
  commitValidationIntent?: ContentValidationIntent
  fallbackMessage: string
  mapError?: (error: unknown) => string | undefined
  invalidPresentation?: ContentFormInvalidPresentation
  /** Applied immediately before commit schema validation. Persist still receives raw form values. */
  prepareCommitValues?: (values: TValues) => TValues
  /** Feature-owned persistence — called only after commit validation passes. */
  persist: FormSubmitHandler<TValues>
}

export type UseContentFormSubmitResult<TValues extends FieldValues> =
  UseSubmitHandlerResult<TValues> & {
    /** Render inside the form header so invalid-submit focus can expand sections. */
    UiBridge: () => null
  }

function resolveFirstInvalidPath<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fields: FormItem[],
  formId: string,
): string | undefined {
  const navigation = resolveInvalidSubmitNavigation({
    errors: form.formState.errors,
    fields,
    idPrefix: formId,
    getItemValues: (fullName, index) => {
      const value = form.getValues(`${fullName}.${index}` as never)
      return typeof value === 'object' && value !== null
        ? (value as Record<string, unknown>)
        : undefined
    },
  })
  return navigation?.firstIssue.path
}

export function presentContentFormInvalidSubmit<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  ui: Pick<FormUiContextValue, 'markSubmitAttempted' | 'addValidationSessionExpandKeys'> | null,
  presentation: ContentFormInvalidPresentation,
  options?: { firstInvalidPath?: string },
): void {
  const firstPath =
    options?.firstInvalidPath ??
    resolveFirstInvalidPath(form, presentation.resolverFields, presentation.formId)
  const viewId =
    firstPath && presentation.resolveViewForPath
      ? presentation.resolveViewForPath(firstPath)
      : undefined

  if (viewId && presentation.activateView) {
    presentation.activateView(viewId)
  }

  if (!ui) return

  const errors = form.formState.errors

  navigateInvalidSubmit(form, presentation.resolverFields, presentation.formId, ui, errors, {
    ...(viewId ? { waitForLayout: true } : {}),
  })
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
    persist,
  } = options

  const uiRef = useRef<Pick<
    FormUiContextValue,
    'markSubmitAttempted' | 'addValidationSessionExpandKeys'
  > | null>(null)

  const publishSchema = resolveContentFormSchema(def, ctx, commitValidationIntent)

  const { onSubmit, formError } = useSubmitHandler<TValues>({
    fallbackMessage,
    mapError: (error) => {
      if (error instanceof ContentFormSubmitValidationFailed) return undefined
      return mapError?.(error)
    },
    submit: async (values, form) => {
      const commitValues = prepareCommitValues?.(values) ?? values
      const commitResult = publishSchema.safeParse(commitValues)
      if (!commitResult.success) {
        form.clearErrors()
        const issues = zodIssuesToValidationIssues(commitResult.error.issues)
        applyValidationIssuesToForm(form, issues)
        if (invalidPresentation) {
          presentContentFormInvalidSubmit(form, uiRef.current, invalidPresentation, {
            firstInvalidPath: issues[0]?.path,
          })
        }
        throw new ContentFormSubmitValidationFailed()
      }

      try {
        await persist(values, form)
      } catch (err) {
        const issues = getApiValidationIssues(err)
        if (issues && invalidPresentation) {
          form.clearErrors()
          applyValidationIssuesToForm(form, issues)
          presentContentFormInvalidSubmit(form, uiRef.current, invalidPresentation, {
            firstInvalidPath: issues[0]?.path,
          })
        }
        throw err
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
