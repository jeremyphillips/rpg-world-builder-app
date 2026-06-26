'use client'

import * as React from 'react'
import { FormProvider, type FieldValues, type UseFormReturn } from 'react-hook-form'

import { FileFieldPropsProvider } from './file-field-props.context'
import { FormSectionContext } from './form-section-context.client'
import type { FileFieldPropsMap } from './field-config'

interface SchemaFormShellProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>
  formId: string
  fileFieldProps?: FileFieldPropsMap
  collapsibleSections: boolean
  onSubmit: (values: TFieldValues, form: UseFormReturn<TFieldValues>) => void
  className?: string | undefined
  children: React.ReactNode
}

/** Shared FormProvider + schema-driven form element wrapper for Form and TabbedForm. */
export function SchemaFormShell<TFieldValues extends FieldValues>({
  form,
  formId,
  fileFieldProps,
  collapsibleSections,
  onSubmit,
  className,
  children,
}: SchemaFormShellProps<TFieldValues>) {
  const sectionContext = React.useMemo(
    () => ({ collapsibleSections, depth: 0 }),
    [collapsibleSections],
  )

  return (
    <FormProvider {...form}>
      <FileFieldPropsProvider value={fileFieldProps ?? {}}>
        <form
          id={formId}
          noValidate
          onSubmit={form.handleSubmit((values) => onSubmit(values, form))}
          className={className}
        >
          <FormSectionContext.Provider value={sectionContext}>
            {children}
          </FormSectionContext.Provider>
        </form>
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
