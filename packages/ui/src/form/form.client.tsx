'use client'

import * as React from 'react'
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form'
import type { ZodType } from 'zod'

import { cn } from '../lib/utils'
import { Text } from '../components/ui/text'
import { FormItems } from './form-items.client'
import { FileFieldPropsProvider } from './file-field-props.context'
import { makeResolver } from './resolver'
import { buildDefaultValues, type FileFieldPropsMap, type FormItem } from './field-config'

export interface FormProps<TFieldValues extends FieldValues> {
  /** Zod schema (typically from `@rpg/contracts`) driving validation + types. */
  schema: ZodType<TFieldValues>
  /** Ordered fields/rows/groups to render. */
  fields: FormItem[]
  /**
   * Called with validated, hidden-field-stripped values. The second argument is
   * the form instance — use it to surface server-side field errors, e.g.
   * `form.setError('name', { message: 'Already taken.' })`.
   */
  onSubmit: (values: TFieldValues, form: UseFormReturn<TFieldValues>) => void | Promise<void>
  /** Overrides for the per-type synthesized defaults. */
  defaultValues?: DefaultValues<TFieldValues>
  /** Form-level error rendered as an alert above the fields. */
  formError?: string | null
  /**
   * Actions row (e.g. submit button), rendered after the fields. Pass a function
   * to read form state (e.g. `formState.isSubmitting`) for a pending submit
   * button — useful now that `<Form>` owns `useForm` internally.
   */
  footer?: React.ReactNode | ((form: UseFormReturn<TFieldValues>) => React.ReactNode)
  className?: string
  /** Classes for the fields wrapper; e.g. `formCardContentClass` inside a `FormCard`. */
  contentClassName?: string
  /** Optional id for the `<form>`; also the prefix for generated control ids. */
  id?: string
  /**
   * Per-file-field remote preview props (e.g. `existingImageUrl` from a storage key).
   * Keyed by field name; not part of the Zod schema.
   */
  fileFieldProps?: FileFieldPropsMap
  /**
   * react-hook-form validation trigger mode. Defaults to `'onSubmit'`.
   * Use `'onChange'` in wizard steps so `formState.isValid` updates reactively
   * and can drive a disabled Next button.
   */
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all'
}

/**
 * The single react-hook-form-aware surface. Owns the `<form>` + `FormProvider`,
 * synthesizes default values from the field configs, and validates with a
 * resolver that treats hidden fields as optional. Conditional fields subscribe
 * only to their declared `dependsOn` keys, so editing one field never re-renders
 * the whole form.
 */
export function Form<TFieldValues extends FieldValues>({
  schema,
  fields,
  onSubmit,
  defaultValues,
  formError,
  footer,
  className,
  contentClassName,
  id,
  fileFieldProps,
  mode,
}: FormProps<TFieldValues>) {
  const generatedId = React.useId()
  const formId = id ?? generatedId

  const resolver = React.useMemo(() => makeResolver<TFieldValues>(schema, fields), [schema, fields])

  // Capture defaults once at mount. RHF v7.52+ auto-resets when `defaultValues`
  // changes reference; callers use the `key` prop to remount when defaults change.
  const [formDefaults] = React.useState(
    () => ({ ...buildDefaultValues(fields), ...defaultValues }) as DefaultValues<TFieldValues>,
  )

  const form = useForm<TFieldValues>({
    resolver,
    defaultValues: formDefaults,
    shouldUnregister: true,
    mode,
  })

  return (
    <FormProvider {...form}>
      <FileFieldPropsProvider value={fileFieldProps ?? {}}>
        <form
          id={formId}
          noValidate
          onSubmit={form.handleSubmit((values) => onSubmit(values, form))}
          className={className}
        >
          <div className={cn('space-y-4', contentClassName)}>
            {formError ? (
              <Text variant="destructive" role="alert">
                {formError}
              </Text>
            ) : null}
            <FormItems items={fields} idPrefix={formId} />
          </div>
          {typeof footer === 'function' ? footer(form) : footer}
        </form>
      </FileFieldPropsProvider>
    </FormProvider>
  )
}
