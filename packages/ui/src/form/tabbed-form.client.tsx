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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
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

/** A single tab definition: an id, a display label, and its ordered fields. */
export interface TabbedFormTab {
  id: string
  label: string
  fields: FormItem[]
}

export interface TabbedFormProps<TFieldValues extends FieldValues> {
  /** Merged Zod schema covering all tabs' fields combined. */
  schema: ZodType<TFieldValues>
  tabs: TabbedFormTab[]
  /** Called with validated values when the global save button is submitted. */
  onSubmit: (values: TFieldValues) => void | Promise<void>
  /** Pre-populate fields; merged on top of per-type synthesized defaults. */
  defaultValues?: DefaultValues<TFieldValues>
  /** Form-level error shown below the tabs. */
  formError?: string | null
  /**
   * Content rendered after the tabs (typically a save button). Pass a function
   * to read live form state (e.g. `formState.isSubmitting`).
   */
  footer?: React.ReactNode | ((form: UseFormReturn<TFieldValues>) => React.ReactNode)
  /** Optional id for the `<form>` element. */
  id?: string
  className?: string
  /** react-hook-form trigger mode. Defaults to `'onSubmit'`. */
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all'
}

interface OmittableSchema {
  shape?: Record<string, unknown>
  omit?: (mask: Record<string, true>) => ZodType
}

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
  allItems: FormItem[],
): Resolver<TFieldValues> {
  return (values, context, options) => {
    const hidden = hiddenFieldNames(allItems, values as Record<string, unknown>)
    const resolver = zodResolver(omitHidden(schema, hidden) as never) as Resolver<TFieldValues>
    return resolver(values, context, options)
  }
}

function isContainer(item: FormItem): item is RowConfig | Extract<FormItem, { kind: 'group' }> {
  return 'kind' in item
}

interface TabFieldNodeProps {
  config: FieldConfig
  idPrefix: string
}

function TabFieldNode({ config, idPrefix }: TabFieldNodeProps) {
  if (config.visibility) {
    return <TabConditionalField config={config} idPrefix={idPrefix} />
  }
  return <FieldRenderer config={config} idPrefix={idPrefix} />
}

function TabConditionalField({ config, idPrefix }: TabFieldNodeProps) {
  const { dependsOn, visibleWhen } = config.visibility!
  const watched = useWatch({ name: dependsOn }) as unknown[]
  const values: Record<string, unknown> = {}
  dependsOn.forEach((name, index) => {
    values[name] = watched[index]
  })
  if (!visibleWhen(values)) return null
  return <FieldRenderer config={config} idPrefix={idPrefix} />
}

interface TabItemsProps {
  items: Array<FormItem | RowConfig>
  idPrefix: string
}

function TabItems({ items, idPrefix }: TabItemsProps) {
  return (
    <>
      {items.map((item, index) => {
        if (!isContainer(item)) {
          return <TabFieldNode key={item.name} config={item} idPrefix={idPrefix} />
        }
        if (item.kind === 'row') {
          return (
            <FieldRow key={`row-${index}`} className={item.className}>
              {item.fields.map((field) => (
                <TabFieldNode key={field.name} config={field} idPrefix={idPrefix} />
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
            <TabItems items={item.fields} idPrefix={idPrefix} />
          </FieldGroup>
        )
      })}
    </>
  )
}

/**
 * A schema-driven form with a tabbed layout. All tabs share a single
 * `useForm` instance over a merged schema; the save button and any form-level
 * error are rendered outside the tab panels so they remain always visible.
 */
export function TabbedForm<TFieldValues extends FieldValues>({
  schema,
  tabs,
  onSubmit,
  defaultValues,
  formError,
  footer,
  id,
  className,
  mode,
}: TabbedFormProps<TFieldValues>) {
  const generatedId = React.useId()
  const formId = id ?? generatedId

  const allItems = React.useMemo(() => tabs.flatMap((t) => t.fields), [tabs])

  const resolver = React.useMemo(
    () => makeResolver<TFieldValues>(schema, allItems),
    [schema, allItems],
  )

  const resolvedDefaults = React.useMemo(
    () => ({ ...buildDefaultValues(allItems), ...defaultValues }) as DefaultValues<TFieldValues>,
    [allItems, defaultValues],
  )

  const form = useForm<TFieldValues>({
    resolver,
    defaultValues: resolvedDefaults,
    mode,
  })

  return (
    <FormProvider {...form}>
      <form
        id={formId}
        noValidate
        onSubmit={form.handleSubmit(onSubmit as SubmitHandler<TFieldValues>)}
        className={cn('space-y-6', className)}
      >
        <Tabs defaultValue={tabs[0]?.id} variant="line">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            // forceMount keeps all panels mounted so every field is registered
            // with RHF and validated on global save; inactive panels are hidden
            // by Radix via the HTML `hidden` attribute.
            <TabsContent key={tab.id} value={tab.id} forceMount>
              <div className="space-y-4">
                <TabItems items={tab.fields} idPrefix={`${formId}-${tab.id}`} />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {formError ? (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        ) : null}

        {typeof footer === 'function' ? footer(form) : footer}
      </form>
    </FormProvider>
  )
}
