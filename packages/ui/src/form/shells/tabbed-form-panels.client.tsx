'use client'

import * as React from 'react'
import { useForm, type DefaultValues, type FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'

import { cn } from '../../lib/utils'
import { fieldStackRhythmVariants } from '../../components/ui/field.variants'
import { Text } from '../../components/ui/text'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs.client'
import { FormItems } from '../containers/form-items.client'
import { ArrayItemPresentationContext } from '../context/array-item-presentation.context'
import { useFormSectionContext } from '../context/form-section.context'
import { makeResolver } from '../config/form-resolver'
import { buildDefaultValues, type FormItem } from '../field-config'
import { FormActionsBar } from '../chrome/form-actions-bar'
import {
  formFooterSpacingClasses,
  formStickyTabsClasses,
  formTabPanelsBottomPaddingClasses,
} from '../chrome/form-chrome.variants'

/** A single tab definition: an id, a display label, and its ordered fields. */
export interface TabbedFormTab {
  id: string
  label: string
  fields: FormItem[]
  /**
   * Optional non-field UI rendered above this tab's fields (intro copy, links,
   * placeholders). Omit fields for a panel that is entirely non-input content.
   */
  header?: React.ReactNode
}

export interface TabbedFormFooterWrapperProps {
  footer: React.ReactNode
  formError: string | null
}

interface UseTabbedFormSetupOptions<TFieldValues extends FieldValues> {
  schema: ZodType<TFieldValues>
  tabs: TabbedFormTab[]
  defaultValues?: DefaultValues<TFieldValues>
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all'
}

/** Resolver, defaults, and RHF instance shared by `<TabbedForm>`. */
export function useTabbedFormSetup<TFieldValues extends FieldValues>({
  schema,
  tabs,
  defaultValues,
  mode,
}: UseTabbedFormSetupOptions<TFieldValues>) {
  const allItems = React.useMemo(() => tabs.flatMap((tab) => tab.fields), [tabs])

  const resolver = React.useMemo(
    () => makeResolver<TFieldValues>(schema, allItems),
    [schema, allItems],
  )

  const resolvedDefaults = React.useMemo(
    () => ({ ...buildDefaultValues(allItems), ...defaultValues }) as DefaultValues<TFieldValues>,
    [allItems, defaultValues],
  )

  // Capture defaults once at mount. RHF v7.52+ auto-resets when `defaultValues`
  // changes reference; callers use the `key` prop to remount when defaults change.
  const [formDefaults] = React.useState(() => resolvedDefaults)

  const form = useForm<TFieldValues>({
    resolver,
    defaultValues: formDefaults,
    mode,
  })

  return { form }
}

interface TabbedFormPanelsProps {
  tabs: TabbedFormTab[]
  formId: string
  stickyChrome: boolean
  stickyTabsClassName?: string
  /** When true, skip extra bottom padding (external footer owns spacing). */
  omitPanelBottomPadding: boolean
}

function TabbedFormTabPanel({
  tab,
  formId,
  panelClassName,
  activeTabId,
}: {
  tab: TabbedFormTab
  formId: string
  panelClassName: string
  activeTabId: string
}) {
  const isActive = activeTabId === tab.id

  return (
    <TabsContent value={tab.id} forceMount>
      <ArrayItemPresentationContext.Provider
        value={{ suppressFieldErrorText: !isActive, rowSummaryId: undefined }}
      >
        <div className={panelClassName}>
          {tab.header}
          {tab.fields.length > 0 ? (
            <FormItems items={tab.fields} idPrefix={`${formId}-${tab.id}`} />
          ) : null}
        </div>
      </ArrayItemPresentationContext.Provider>
    </TabsContent>
  )
}

export function TabbedFormPanels({
  tabs,
  formId,
  stickyChrome,
  stickyTabsClassName,
  omitPanelBottomPadding,
}: TabbedFormPanelsProps) {
  const { rhythm } = useFormSectionContext()
  const [activeTabId, setActiveTabId] = React.useState(tabs[0]?.id ?? '')
  const panelClassName = cn(
    fieldStackRhythmVariants({ rhythm }),
    stickyChrome && !omitPanelBottomPadding ? formTabPanelsBottomPaddingClasses : undefined,
  )

  return (
    <Tabs value={activeTabId} onValueChange={setActiveTabId} variant="line">
      <div className={cn(stickyChrome ? formStickyTabsClasses : undefined, stickyTabsClassName)}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabbedFormTabPanel
          key={tab.id}
          tab={tab}
          formId={formId}
          panelClassName={panelClassName}
          activeTabId={activeTabId}
        />
      ))}
    </Tabs>
  )
}

interface TabbedFormFooterRegionProps {
  footerWrapper?: (props: TabbedFormFooterWrapperProps) => React.ReactNode
  hasFooterRegion: boolean
  stickyChrome: boolean
  stickyActionsBarClassName?: string
  formError?: string | null
  resolvedFooter: React.ReactNode
}

function TabbedFormFlatFooter({
  formError,
  resolvedFooter,
}: Pick<TabbedFormFooterRegionProps, 'formError' | 'resolvedFooter'>) {
  return (
    <>
      {formError ? (
        <Text variant="destructive" role="alert">
          {formError}
        </Text>
      ) : null}
      {resolvedFooter ? <div className={formFooterSpacingClasses}>{resolvedFooter}</div> : null}
    </>
  )
}

export function TabbedFormFooterRegion({
  footerWrapper,
  hasFooterRegion,
  stickyChrome,
  stickyActionsBarClassName,
  formError,
  resolvedFooter,
}: TabbedFormFooterRegionProps) {
  if (footerWrapper) {
    if (!hasFooterRegion) return null
    return footerWrapper({ footer: resolvedFooter, formError: formError ?? null })
  }

  if (stickyChrome) {
    return (
      <FormActionsBar className={stickyActionsBarClassName} formError={formError}>
        {resolvedFooter}
      </FormActionsBar>
    )
  }

  return <TabbedFormFlatFooter formError={formError} resolvedFooter={resolvedFooter} />
}

export function resolveTabbedFormShellClassName(
  className: string | undefined,
  stickyChrome: boolean,
  footerWrapper?: (props: TabbedFormFooterWrapperProps) => React.ReactNode,
): string | undefined {
  return cn(footerWrapper ? undefined : stickyChrome ? undefined : 'space-y-6', className)
}
