'use client'

import * as React from 'react'
import { FormProvider, type FieldValues, type UseFormReturn } from 'react-hook-form'

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
  type FormValidationPresentation,
} from '../context/form-ui.context'
import type { FileFieldPropsMap, FormItem } from '../field-config'
import { navigateInvalidSubmit } from '../config/navigate-invalid-submit.client'

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
  onSubmit: (values: TFieldValues, form: UseFormReturn<TFieldValues>) => void
  className?: string | undefined
  children: React.ReactNode
}

function SchemaFormElement<TFieldValues extends FieldValues>({
  form,
  formId,
  fields,
  onSubmit,
  className,
  children,
}: Pick<
  SchemaFormShellProps<TFieldValues>,
  'form' | 'formId' | 'fields' | 'onSubmit' | 'className' | 'children'
>) {
  const ui = React.useContext(FormUiContext)

  return (
    <form
      id={formId}
      noValidate
      onSubmit={form.handleSubmit(
        (values) => onSubmit(values, form),
        (errors) => navigateInvalidSubmit(form, fields, formId, ui, errors),
      )}
      className={className}
    >
      {children}
    </form>
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
  onSubmit,
  className,
  children,
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
        >
          <SchemaFormElement
            form={form}
            formId={formId}
            fields={fields}
            onSubmit={onSubmit}
            className={className}
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
