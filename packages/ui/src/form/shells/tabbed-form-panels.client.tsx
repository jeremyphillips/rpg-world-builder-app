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
import { useTabbedFormTabValidationState } from '../hooks/use-tabbed-form-tab-validation-state.client'
import { FormActionsBar } from '../chrome/form-actions-bar'
import { getTabPanelIdPrefix } from './tabbed-form-id.lib'
import { TabbedFormTabIssueBadge } from './tabbed-form-tab-issue-badge.client'
import {
  formFooterSpacingClasses,
  formStickyTabsClasses,
  formTabPanelsBottomPaddingClasses,
} from '../chrome/form-chrome.variants'
import { warnHeaderOnlyTabValidationWiring } from './warn-header-only-tab-validation-wiring'

/** A single tab definition: an id, a display label, and its ordered fields. */
export interface TabbedFormTab {
  id: string
  label: string
  fields: FormItem[]
  /**
   * Extra root paths whose validation issues belong to this tab (merged with
   * prefixes inferred from `fields`; supplements only — does not replace them).
   */
  errorPaths?: string[]
  /**
   * Field configs merged into the Zod resolver error map only — not rendered.
   * Use for header/master-detail editors whose controls register under paths
   * outside `fields` (e.g. `heritage.name` with `namePrefix` in the tab header).
   */
  resolverFields?: FormItem[]
  /**
   * Optional non-field UI rendered above this tab's fields (intro copy, links,
   * placeholders). Omit fields for a panel that is entirely non-input content.
   */
  header?: React.ReactNode
  /**
   * When true, skips dev warnings and dashboard test assertions for header-only
   * validation wiring (e.g. non-form chrome tabs like subclass management).
   */
  skipHeaderOnlyValidationWiring?: boolean
}

/** Merges visible tab fields with supplemental resolver-only configs. */
export function collectTabbedFormResolverItems(tabs: readonly TabbedFormTab[]): FormItem[] {
  return tabs.flatMap((tab) => [...tab.fields, ...(tab.resolverFields ?? [])])
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
  const resolverItems = React.useMemo(() => collectTabbedFormResolverItems(tabs), [tabs])

  const resolver = React.useMemo(
    () => makeResolver<TFieldValues>(schema, resolverItems),
    [schema, resolverItems],
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
    reValidateMode: 'onChange',
  })

  React.useEffect(() => {
    warnHeaderOnlyTabValidationWiring(tabs)
  }, [tabs])

  return { form }
}

interface TabbedFormPanelsProps {
  tabs: TabbedFormTab[]
  formId: string
  activeTabId: string
  onActiveTabChange: (tabId: string) => void
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
    <TabsContent value={tab.id} forceMount data-tab-panel={tab.id}>
      <ArrayItemPresentationContext.Provider
        value={{ suppressFieldErrorText: !isActive, rowSummaryId: undefined }}
      >
        <div className={panelClassName}>
          {tab.header}
          {tab.fields.length > 0 ? (
            <FormItems items={tab.fields} idPrefix={getTabPanelIdPrefix(formId, tab.id)} />
          ) : null}
        </div>
      </ArrayItemPresentationContext.Provider>
    </TabsContent>
  )
}

export function TabbedFormPanels({
  tabs,
  formId,
  activeTabId,
  onActiveTabChange,
  stickyChrome,
  stickyTabsClassName,
  omitPanelBottomPadding,
}: TabbedFormPanelsProps) {
  const { rhythm } = useFormSectionContext()
  const { tabStates } = useTabbedFormTabValidationState(tabs)
  const tabStateById = React.useMemo(
    () => new Map(tabStates.map((state) => [state.tabId, state])),
    [tabStates],
  )
  const panelClassName = cn(
    fieldStackRhythmVariants({ rhythm }),
    stickyChrome && !omitPanelBottomPadding ? formTabPanelsBottomPaddingClasses : undefined,
  )

  return (
    <Tabs value={activeTabId} onValueChange={onActiveTabChange} variant="line">
      <div className={cn(stickyChrome ? formStickyTabsClasses : undefined, stickyTabsClassName)}>
        <TabsList>
          {tabs.map((tab) => {
            const issueCount = tabStateById.get(tab.id)?.count ?? 0
            return (
              <TabsTrigger key={tab.id} value={tab.id} data-tab-trigger={tab.id}>
                {tab.label}
                <TabbedFormTabIssueBadge count={issueCount} />
              </TabsTrigger>
            )
          })}
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
  validationSummary?: React.ReactNode
  resolvedFooter: React.ReactNode
}

function TabbedFormFlatFooter({
  formError,
  validationSummary,
  resolvedFooter,
}: Pick<TabbedFormFooterRegionProps, 'formError' | 'validationSummary' | 'resolvedFooter'>) {
  return (
    <>
      {formError ? (
        <Text variant="destructive" role="alert">
          {formError}
        </Text>
      ) : null}
      {validationSummary}
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
  validationSummary,
  resolvedFooter,
}: TabbedFormFooterRegionProps) {
  if (footerWrapper) {
    if (!hasFooterRegion) return null
    return footerWrapper({ footer: resolvedFooter, formError: formError ?? null })
  }

  if (stickyChrome) {
    return (
      <FormActionsBar
        className={stickyActionsBarClassName}
        formError={formError}
        validationSummary={validationSummary}
      >
        {resolvedFooter}
      </FormActionsBar>
    )
  }

  return (
    <TabbedFormFlatFooter
      formError={formError}
      validationSummary={validationSummary}
      resolvedFooter={resolvedFooter}
    />
  )
}

export function resolveTabbedFormShellClassName(
  className: string | undefined,
  stickyChrome: boolean,
  footerWrapper?: (props: TabbedFormFooterWrapperProps) => React.ReactNode,
): string | undefined {
  return cn(footerWrapper ? undefined : stickyChrome ? undefined : 'space-y-6', className)
}
