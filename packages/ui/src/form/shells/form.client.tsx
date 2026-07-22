'use client'

import * as React from 'react'
import { useForm, type DefaultValues, type FieldValues, type UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'

import { Text } from '../../components/ui/text'
import type { FieldSize } from '../../components/ui/field.client'
import type { FieldStackRhythm } from '../../components/ui/field.variants'
import { FormItems } from '../containers/form-items.client'
import { FormRhythmStack } from '../context/form-section.context'
import { resolveSchemaFormFooter, SchemaFormShell } from './schema-form-shell.client'
import { createValidateSilently, makeResolver } from '../config/form-resolver'
import type { ValidateSilently } from '../context/form-ui.context'
import {
  buildDefaultValues,
  flattenFields,
  type FileFieldPropsMap,
  type FormItem,
  type FormValueSync,
} from '../field-config'
import { assertOptionalDisclosureFieldConfigs } from '../config/optional-disclosure-config.lib'
import { FormActionsBar } from '../chrome/form-actions-bar'
import { formFooterSpacingClasses } from '../chrome/form-chrome.variants'
import { FormValueSyncEffects } from '../chrome/form-value-sync-effects.client'
import type { FormValidationPresentation } from '../context/form-ui.context'

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
   * Scopes persisted form UI state (e.g. array item collapse) to a stable form
   * instance — typically an entity or campaign id.
   */
  uiStateKey?: string
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
  /** When true, the footer sticks to the bottom while field content scrolls. */
  stickyFooter?: boolean
  /**
   * Vertical gap between top-level fields/groups. Defaults to `comfortable`
   * (`gap-6`). Array sections default to `compact` regardless.
   */
  rhythm?: FieldStackRhythm
  /**
   * Control + label scale for leaf fields. When omitted, `compact` rhythm maps to
   * `sm` and `comfortable` maps to `md`.
   */
  size?: FieldSize
  /** Patches form values when configured driver fields change after initial mount. */
  valueSyncs?: FormValueSync[]
  /**
   * Controls when array row issue chrome appears. Defaults to `progressive` — issue
   * badges on untouched rows appear only after the first failed submit.
   */
  validationPresentation?: FormValidationPresentation
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
  uiStateKey,
  fileFieldProps,
  mode,
  stickyFooter = false,
  rhythm,
  size,
  valueSyncs,
  validationPresentation,
}: FormProps<TFieldValues>) {
  const generatedId = React.useId()
  const formId = id ?? generatedId

  const resolver = React.useMemo(() => makeResolver<TFieldValues>(schema, fields), [schema, fields])
  const validateSilently = React.useMemo(
    () => createValidateSilently(resolver) as ValidateSilently,
    [resolver],
  )

  // Capture defaults once at mount. RHF v7.52+ auto-resets when `defaultValues`
  // changes reference; callers use the `key` prop to remount when defaults change.
  const [formDefaults] = React.useState(
    () => ({ ...buildDefaultValues(fields), ...defaultValues }) as DefaultValues<TFieldValues>,
  )

  React.useEffect(() => {
    assertOptionalDisclosureFieldConfigs(flattenFields(fields))
  }, [fields])

  const form = useForm<TFieldValues>({
    resolver,
    defaultValues: formDefaults,
    shouldUnregister: true,
    mode,
  })

  const resolvedFooter = resolveSchemaFormFooter(footer, form)

  return (
    <SchemaFormShell
      form={form}
      formId={formId}
      fields={fields}
      fileFieldProps={fileFieldProps}
      uiStateKey={uiStateKey}
      rhythm={rhythm}
      size={size}
      validationPresentation={validationPresentation}
      validateSilently={validateSilently}
      onSubmit={onSubmit}
      className={className}
    >
      <FormRhythmStack className={contentClassName}>
        {!stickyFooter && formError ? (
          <Text variant="destructive" role="alert">
            {formError}
          </Text>
        ) : null}
        {valueSyncs && valueSyncs.length > 0 ? (
          <FormValueSyncEffects valueSyncs={valueSyncs} />
        ) : null}
        <FormItems items={fields} idPrefix={formId} />
      </FormRhythmStack>
      {stickyFooter ? (
        <FormActionsBar formError={formError}>{resolvedFooter}</FormActionsBar>
      ) : resolvedFooter ? (
        <div className={formFooterSpacingClasses}>{resolvedFooter}</div>
      ) : null}
    </SchemaFormShell>
  )
}
