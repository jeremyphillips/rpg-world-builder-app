'use client'

import * as React from 'react'
import {
  FormProvider,
  type FieldErrors,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form'

import { FileFieldPropsProvider } from '../context/file-field-props.context'
import { FormSectionContext } from '../context/form-section.context'
import { DEFAULT_FORM_DENSITY, type FormDensity } from '../form-density'
import {
  FormUiContext,
  FormUiProvider,
  type FormUiContextValue,
  type FormValidationPresentation,
  type ValidateSilently,
} from '../context/form-ui.context'
import type { FileFieldPropsMap, FormItem } from '../field-config'
import { navigateInvalidSubmit } from '../config/navigate-invalid-submit.client'
import {
  FormShellFooterPublisher,
  type FormShellExternalFooterContent,
  type FormShellFooterModel,
} from '../chrome/form-shell-footer.context'
import type { SchemaFormRequestSubmit } from '../schema-form-request-submit.types'

export type {
  SchemaFormRequestSubmit,
  SchemaFormSubmitHandler,
} from '../schema-form-request-submit.types'

type SchemaFormSubmitContextValue<TFieldValues extends FieldValues> = {
  requestSubmit: SchemaFormRequestSubmit<TFieldValues>
}

const SchemaFormSubmitContext =
  React.createContext<SchemaFormSubmitContextValue<FieldValues> | null>(null)

/** Imperative submit with the same invalid-submit navigation as the primary form submit. */
export function useSchemaFormSubmit<
  TFieldValues extends FieldValues = FieldValues,
>(): SchemaFormSubmitContextValue<TFieldValues> | null {
  return React.useContext(
    SchemaFormSubmitContext,
  ) as SchemaFormSubmitContextValue<TFieldValues> | null
}

interface SchemaFormShellProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>
  formId: string
  fields: FormItem[]
  fileFieldProps?: FileFieldPropsMap
  /** Scopes persisted form UI state to a stable form instance. */
  uiStateKey?: string
  /** Section density for top-level fields/groups. Defaults to `comfortable`. */
  density?: FormDensity
  validationPresentation?: FormValidationPresentation
  /** Shared submit-attempt flag for tabbed layouts; see `FormUiProvider`. */
  hasAttemptedSubmit?: boolean
  onMarkSubmitAttempted?: () => void
  validateSilently?: ValidateSilently
  onSubmit: (values: TFieldValues, form: UseFormReturn<TFieldValues>) => void
  /** Overrides default failed-submit navigation (expand keys + focus). */
  onInvalidSubmit?: (
    form: UseFormReturn<TFieldValues>,
    fields: FormItem[],
    formId: string,
    ui: Pick<FormUiContextValue, 'markSubmitAttempted' | 'addValidationSessionExpandKeys'>,
    errors: FieldErrors<TFieldValues>,
  ) => void
  className?: string | undefined
  /** When true, the `<form>` wraps body content only; footer publishers render outside it. */
  externalFooter?: boolean
  /** Footer chrome published to {@link FormShellFooterSlot} when {@link externalFooter} is true. */
  externalFooterContent?: FormShellExternalFooterContent | null
  children: React.ReactNode
}

function SchemaFormExternalFooterPublisher<TFieldValues extends FieldValues>({
  content,
  requestSubmit,
}: {
  content: FormShellExternalFooterContent
  requestSubmit: SchemaFormRequestSubmit<TFieldValues>
}) {
  const model = React.useMemo(
    (): FormShellFooterModel => ({
      formId: content.formId,
      footer: content.footer,
      formError: content.formError,
      validationSummary: content.validationSummary,
      requestSubmit: requestSubmit as FormShellFooterModel['requestSubmit'],
    }),
    [content, requestSubmit],
  )

  return <FormShellFooterPublisher model={model} />
}

function SchemaFormElement<TFieldValues extends FieldValues>({
  form,
  formId,
  fields,
  onSubmit,
  onInvalidSubmit,
  className,
  externalFooter,
  externalFooterContent,
  children,
}: Pick<
  SchemaFormShellProps<TFieldValues>,
  | 'form'
  | 'formId'
  | 'fields'
  | 'onSubmit'
  | 'onInvalidSubmit'
  | 'className'
  | 'externalFooter'
  | 'externalFooterContent'
  | 'children'
>) {
  const ui = React.useContext(FormUiContext)

  const runSubmitHandler = React.useCallback(
    async (
      values: TFieldValues,
      handler: (values: TFieldValues, form: UseFormReturn<TFieldValues>) => void | Promise<void>,
    ) => {
      try {
        await handler(values, form)
      } catch {
        // Submit adapters surface root/field errors before rejecting.
      }
    },
    [form],
  )

  const requestSubmit = React.useCallback<SchemaFormRequestSubmit<TFieldValues>>(
    (handler, onInvalid) => {
      const resolvedHandler = handler ?? onSubmit
      void form.handleSubmit(
        (values) => runSubmitHandler(values, resolvedHandler),
        (errors) => {
          onInvalid?.()
          if (onInvalidSubmit) {
            onInvalidSubmit(form, fields, formId, ui, errors)
            return
          }
          navigateInvalidSubmit(form, fields, formId, ui, errors)
        },
      )()
    },
    [fields, form, formId, onInvalidSubmit, onSubmit, runSubmitHandler, ui],
  )

  const submitContext = React.useMemo(() => ({ requestSubmit }), [requestSubmit])

  const formElement = (
    <form
      id={formId}
      noValidate
      onSubmit={form.handleSubmit(
        (values) => runSubmitHandler(values, onSubmit),
        (errors) => {
          if (onInvalidSubmit) {
            onInvalidSubmit(form, fields, formId, ui, errors)
            return
          }
          navigateInvalidSubmit(form, fields, formId, ui, errors)
        },
      )}
      className={className}
    >
      {children}
    </form>
  )

  return (
    <SchemaFormSubmitContext.Provider
      value={submitContext as SchemaFormSubmitContextValue<FieldValues>}
    >
      {externalFooter ? (
        <>
          {formElement}
          {externalFooterContent ? (
            <SchemaFormExternalFooterPublisher
              content={externalFooterContent}
              requestSubmit={requestSubmit}
            />
          ) : null}
        </>
      ) : (
        formElement
      )}
    </SchemaFormSubmitContext.Provider>
  )
}

/** Shared FormProvider + schema-driven form element wrapper for Form and TabbedForm. */
export function SchemaFormShell<TFieldValues extends FieldValues>({
  form,
  formId,
  fields,
  fileFieldProps,
  uiStateKey,
  density = DEFAULT_FORM_DENSITY,
  validationPresentation = 'progressive',
  hasAttemptedSubmit,
  onMarkSubmitAttempted,
  validateSilently,
  onSubmit,
  onInvalidSubmit,
  className,
  externalFooter,
  externalFooterContent,
  children,
}: SchemaFormShellProps<TFieldValues>) {
  const sectionContext = React.useMemo(
    () => ({ depth: 0, namedGroupDepth: 0, headingTier: 'section' as const, density }),
    [density],
  )

  return (
    <FormProvider {...form}>
      <FileFieldPropsProvider value={fileFieldProps ?? {}}>
        <FormUiProvider
          uiStateKey={uiStateKey}
          fields={fields}
          validationPresentation={validationPresentation}
          hasAttemptedSubmit={hasAttemptedSubmit}
          onMarkSubmitAttempted={onMarkSubmitAttempted}
          validateSilently={validateSilently}
        >
          <SchemaFormElement
            form={form}
            formId={formId}
            fields={fields}
            onSubmit={onSubmit}
            onInvalidSubmit={onInvalidSubmit}
            className={className}
            externalFooter={externalFooter}
            externalFooterContent={externalFooterContent}
          >
            <FormSectionContext.Provider value={sectionContext}>
              {children}
            </FormSectionContext.Provider>
          </SchemaFormElement>
        </FormUiProvider>
      </FileFieldPropsProvider>
    </FormProvider>
  )
}

export function resolveSchemaFormFooter<TFieldValues extends FieldValues>(
  footer: React.ReactNode | ((form: UseFormReturn<TFieldValues>) => React.ReactNode),
  form: UseFormReturn<TFieldValues>,
): React.ReactNode {
  return typeof footer === 'function' ? footer(form) : footer
}
