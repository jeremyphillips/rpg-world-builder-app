import { useContext, useRef } from 'react'
import type { ContentValidationIntent } from '@rpg/contracts'
import { getApiValidationIssues } from '@rpg/contracts'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import {
  buildFieldControlId,
  FormUiContext,
  navigateInvalidSubmit,
  resolveInvalidSubmitNavigation,
  useSubmitHandler,
  type FormItem,
  type FormSubmitHandler,
  type FormUiContextValue,
  type MapFormError,
  type UseSubmitHandlerResult,
} from '@rpg/ui/form'

import {
  applyContentPublishValidation,
  applyValidationIssuesToForm,
} from '../../validation/content-publish-validation.lib'
import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'
import { resolveContentFormSchema, resolveContentPublishSchema } from '../edit/content-edit-load'

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
  mapError?: MapFormError
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

function presentPersistValidationFailure<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  error: unknown,
  presentation: ContentFormInvalidPresentation | undefined,
  ui: Pick<FormUiContextValue, 'markSubmitAttempted' | 'addValidationSessionExpandKeys'> | null,
): void {
  const issues = getApiValidationIssues(error)
  if (!issues || !presentation) return

  form.clearErrors()
  applyValidationIssuesToForm(form, issues)
  presentContentFormInvalidSubmit(form, ui, presentation, {
    firstInvalidPath: issues[0]?.path,
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
    'markSubmitAttempted' | 'markPublishAttempted' | 'addValidationSessionExpandKeys'
  > | null>(null)

  const publishSchema =
    commitValidationIntent === 'publish'
      ? resolveContentPublishSchema(def, ctx)
      : resolveContentFormSchema(def, ctx, commitValidationIntent)

  const { onSubmit, formError } = useSubmitHandler<TValues>({
    fallbackMessage,
    mapError: (error) => {
      if (error instanceof ContentFormSubmitValidationFailed) return null
      return mapError?.(error)
    },
    submit: async (values, form) => {
      const commitValues = prepareCommitValues?.(values) ?? values
      const issues = applyContentPublishValidation(
        form,
        publishSchema,
        commitValues,
        invalidPresentation?.resolverFields ?? [],
      )
      if (issues) {
        if (commitValidationIntent === 'publish') {
          uiRef.current?.markPublishAttempted()
        }
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
        presentPersistValidationFailure(form, err, invalidPresentation, uiRef.current)
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

/** Activates the view that owns `path`, then focuses that control or `[data-form-focus]`. */
export function focusFormPath(
  path: string,
  presentation: Pick<
    ContentFormInvalidPresentation,
    'formId' | 'resolveViewForPath' | 'activateView'
  >,
): void {
  const viewId = presentation.resolveViewForPath?.(path)
  if (viewId) presentation.activateView?.(viewId)
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const control = document.getElementById(
        buildFieldControlId(presentation.formId, undefined, path),
      )
      const marked = document.querySelector(`[data-form-focus="${path}"]`)
      const element = control ?? marked
      if (!(element instanceof HTMLElement)) return
      element.scrollIntoView({ block: 'center' })
      const focusable = element.matches('button, input, select, textarea, [tabindex]')
        ? element
        : element.querySelector<HTMLElement>('button, input, select, textarea, [tabindex]')
      focusable?.focus()
    })
  })
}
