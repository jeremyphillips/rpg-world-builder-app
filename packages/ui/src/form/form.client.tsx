'use client'

import * as React from 'react'
import {
  FormProvider,
  useForm,
  useWatch,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType } from 'zod'

import { cn } from '../lib/utils'
import { FieldGroup } from '../components/ui/field-group'
import { FieldRow } from '../components/ui/field-row'
import { FieldRenderer } from './field-renderer.client'
import {
  buildDefaultValues,
  hiddenFieldNames,
  type FieldConfig,
  type FormItem,
  type RowConfig,
} from './field-config'

/**
 * A schema as duck-typed for the hidden-field omission below. We avoid
 * `instanceof` so it works even if the app and `@rpg/ui` resolve different `zod`
 * copies; a non-object schema simply skips omission.
 */
interface OmittableSchema {
  shape?: Record<string, unknown>
  omit?: (mask: Record<string, true>) => ZodType
}

/**
 * Drops hidden field keys from an object schema so they aren't validated — i.e.
 * a `required` field is only required while visible. Object schemas also strip
 * the hidden keys from their output, so the submitted payload omits them too.
 * Non-object (e.g. refined) schemas are returned unchanged (documented limit).
 */
function omitHidden(schema: ZodType, hidden: string[]): ZodType {
  if (hidden.length === 0) return schema
  const obj = schema as unknown as OmittableSchema
  if (!obj.shape || typeof obj.omit !== 'function') return schema
  const mask: Record<string, true> = {}
  for (const name of hidden) {
    if (name in obj.shape) mask[name] = true
  }
  return Object.keys(mask).length > 0 ? obj.omit(mask) : schema
}

function makeResolver<TFieldValues extends FieldValues>(
  schema: ZodType,
  items: FormItem[],
): Resolver<TFieldValues> {
  return (values, context, options) => {
    const hidden = hiddenFieldNames(items, values as Record<string, unknown>)
    // `zodResolver` over-constrains the schema's input type; the runtime schema
    // is correct, so widen the argument at this one boundary.
    const resolver = zodResolver(omitHidden(schema, hidden) as never) as Resolver<TFieldValues>
    return resolver(values, context, options)
  }
}

export interface FormProps<TFieldValues extends FieldValues> {
  /** Zod schema (typically from `@rpg/contracts`) driving validation + types. */
  schema: ZodType<TFieldValues>
  /** Ordered fields/rows/groups to render. */
  fields: FormItem[]
  /** Called with validated, hidden-field-stripped values. */
  onSubmit: (values: TFieldValues) => void | Promise<void>
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
  mode,
}: FormProps<TFieldValues>) {
  const generatedId = React.useId()
  const formId = id ?? generatedId

  const resolver = React.useMemo(() => makeResolver<TFieldValues>(schema, fields), [schema, fields])

  const resolvedDefaults = React.useMemo(
    () => ({ ...buildDefaultValues(fields), ...defaultValues }) as DefaultValues<TFieldValues>,
    [fields, defaultValues],
  )

  // Capture the defaults once at mount time. RHF v7.52+ auto-resets when
  // `defaultValues` changes reference; callers use the `key` prop to remount
  // when defaults genuinely need to change, so the ref stays stable.
  const stableDefaults = React.useRef(resolvedDefaults)

  const form = useForm<TFieldValues>({
    resolver,
    defaultValues: stableDefaults.current,
    shouldUnregister: true,
    mode,
  })

  return (
    <FormProvider {...form}>
      <form
        id={formId}
        noValidate
        onSubmit={form.handleSubmit(onSubmit as SubmitHandler<TFieldValues>)}
        className={className}
      >
        <div className={cn('space-y-4', contentClassName)}>
          {formError ? (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          ) : null}
          <FormItems items={fields} idPrefix={formId} />
        </div>
        {typeof footer === 'function' ? footer(form) : footer}
      </form>
    </FormProvider>
  )
}

function isContainer(item: FormItem): item is RowConfig | Extract<FormItem, { kind: 'group' }> {
  return 'kind' in item
}

interface FormItemsProps {
  items: Array<FormItem | RowConfig>
  idPrefix: string
}

/** Renders an ordered list of fields/rows/groups, recursing into groups. */
function FormItems({ items, idPrefix }: FormItemsProps) {
  return (
    <>
      {items.map((item, index) => {
        if (!isContainer(item)) {
          return <FieldNode key={item.name} config={item} idPrefix={idPrefix} />
        }
        if (item.kind === 'row') {
          return (
            <FieldRow key={`row-${index}`} className={item.className}>
              {item.fields.map((field) => (
                <FieldNode key={field.name} config={field} idPrefix={idPrefix} />
              ))}
            </FieldRow>
          )
        }
        return (
          <FieldGroup
            key={`group-${index}`}
            legend={item.legend}
            description={item.description}
            className={item.className}
          >
            <FormItems items={item.fields} idPrefix={idPrefix} />
          </FieldGroup>
        )
      })}
    </>
  )
}

interface FieldNodeProps {
  config: FieldConfig
  idPrefix: string
}

/** Routes a field to the conditional wrapper when it declares `visibility`. */
function FieldNode({ config, idPrefix }: FieldNodeProps) {
  if (config.visibility) {
    return <ConditionalField config={config} idPrefix={idPrefix} />
  }
  return <FieldRenderer config={config} idPrefix={idPrefix} />
}

/**
 * Subscribes to *only* the field's `dependsOn` values via `useWatch`, so a change
 * elsewhere never re-renders this field. With the form's `shouldUnregister`, the
 * control unmounts (and its value clears) while hidden.
 */
function ConditionalField({ config, idPrefix }: FieldNodeProps) {
  const { dependsOn, visibleWhen } = config.visibility!
  const watched = useWatch({ name: dependsOn }) as unknown[]
  const values: Record<string, unknown> = {}
  dependsOn.forEach((name, index) => {
    values[name] = watched[index]
  })
  if (!visibleWhen(values)) return null
  return <FieldRenderer config={config} idPrefix={idPrefix} />
}
