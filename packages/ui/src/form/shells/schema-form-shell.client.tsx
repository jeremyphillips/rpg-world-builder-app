'use client'

import * as React from 'react'
import {
  FormProvider,
  type FieldErrors,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form'

import { FileFieldPropsProvider } from '../context/file-field-props.context'
import {
  DEFAULT_FORM_RHYTHM,
  resolveFormFieldSize,
  type FieldStackRhythm,
} from '../../components/ui/field.variants'
import type { FieldSize } from '../../components/ui/field.client'
import { FormSectionContext } from '../context/form-section.context'
import {
  FormUiContext,
  FormUiProvider,
  type FormUiContextValue,
  type FormValidationPresentation,
  type ValidateSilently,
} from '../context/form-ui.context'
import type { FileFieldPropsMap, FormItem } from '../field-config'
import { navigateInvalidSubmit } from '../config/navigate-invalid-submit.client'

export type SchemaFormSubmitHandler<TFieldValues extends FieldValues> = (
  values: TFieldValues,
  form: UseFormReturn<TFieldValues>,
) => void | Promise<void>

type SchemaFormSubmitContextValue<TFieldValues extends FieldValues> = {
  requestSubmit: (handler: SchemaFormSubmitHandler<TFieldValues>, onInvalid?: () => void) => void
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
  /** Vertical gap between top-level fields/groups. Defaults to `comfortable` (`gap-6`). */
  rhythm?: FieldStackRhythm
  /**
   * Control + label scale for leaf fields. When omitted, `compact` rhythm maps to
   * `sm` and `comfortable` maps to `md`.
   */
  size?: FieldSize
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
  children: React.ReactNode
  /** Rendered outside the `<form>` when {@link externalFooter} is true. */
  externalFooterPublisher?: React.ReactNode
}

function SchemaFormElement<TFieldValues extends FieldValues>({
  form,
  formId,
  fields,
  onSubmit,
  onInvalidSubmit,
  className,
  externalFooter,
  children,
  externalFooterPublisher,
}: Pick<
  SchemaFormShellProps<TFieldValues>,
  | 'form'
  | 'formId'
  | 'fields'
  | 'onSubmit'
  | 'onInvalidSubmit'
  | 'className'
  | 'externalFooter'
  | 'children'
  | 'externalFooterPublisher'
>) {
  const ui = React.useContext(FormUiContext)

  const requestSubmit = React.useCallback(
    (handler: SchemaFormSubmitHandler<TFieldValues>, onInvalid?: () => void) => {
      void form.handleSubmit(
        (values) => handler(values, form),
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
    [fields, form, formId, onInvalidSubmit, ui],
  )

  const submitContext = React.useMemo(() => ({ requestSubmit }), [requestSubmit])

  const formElement = (
    <form
      id={formId}
      noValidate
      onSubmit={form.handleSubmit(
        (values) => onSubmit(values, form),
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
          {externalFooterPublisher}
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
  rhythm = DEFAULT_FORM_RHYTHM,
  size,
  validationPresentation = 'progressive',
  hasAttemptedSubmit,
  onMarkSubmitAttempted,
  validateSilently,
  onSubmit,
  onInvalidSubmit,
  className,
  externalFooter,
  children,
  externalFooterPublisher,
}: SchemaFormShellProps<TFieldValues>) {
  const resolvedSize = resolveFormFieldSize({ explicit: size, rhythm })
  const sectionContext = React.useMemo(
    () => ({ depth: 0, rhythm, size: resolvedSize }),
    [rhythm, resolvedSize],
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
            externalFooterPublisher={externalFooterPublisher}
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
