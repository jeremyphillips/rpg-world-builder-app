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
import { fieldGroupStackClasses } from '../components/ui/field.variants'
import { Text } from '../components/ui/text'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs.client'
import { FormItems } from './form-items.client'
import { FormSectionContext } from './form-section-context.client'
import { FileFieldPropsProvider } from './file-field-props.context'
import { makeResolver } from './resolver'
import { buildDefaultValues, type FileFieldPropsMap, type FormItem } from './field-config'

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
  /**
   * Called with validated values when the global save button is submitted. The
   * second argument is the form instance — use it to surface server-side field
   * errors via `form.setError`.
   */
  onSubmit: (values: TFieldValues, form: UseFormReturn<TFieldValues>) => void | Promise<void>
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
  /**
   * Per-file-field remote preview props (e.g. `existingImageUrl` from a storage key).
   * Keyed by field name; not part of the Zod schema.
   */
  fileFieldProps?: FileFieldPropsMap
  className?: string
  /** react-hook-form trigger mode. Defaults to `'onSubmit'`. */
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all'
  /** When true (default), top-level groups/arrays render in collapsible accordions. */
  collapsibleSections?: boolean
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
  fileFieldProps,
  className,
  mode,
  collapsibleSections = true,
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
                <div className={fieldGroupStackClasses}>
                  <FormSectionContext.Provider value={sectionContext}>
                    <FormItems items={tab.fields} idPrefix={`${formId}-${tab.id}`} />
                  </FormSectionContext.Provider>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {formError ? (
            <Text variant="destructive" role="alert">
              {formError}
            </Text>
          ) : null}

          {typeof footer === 'function' ? footer(form) : footer}
        </form>
      </FileFieldPropsProvider>
    </FormProvider>
  )
}
