'use client'

import * as React from 'react'
import { useForm, type DefaultValues, type FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'

import { cn } from '../../lib/utils'
import { fieldStackRhythmVariants } from '../../components/ui/field.variants'
import {
  SegmentedControl,
  type SegmentedControlOption,
} from '../../components/ui/segmented-control.client'
import { Text } from '../../components/ui/text'
import { FormItems } from '../containers/form-items.client'
import { ArrayItemPresentationContext } from '../context/array-item-presentation.context'
import { useFormSectionContext } from '../context/form-section.context'
import { resolveFormDensity } from '../form-density'
import { createValidateSilently, makeResolver } from '../config/form-resolver'
import { buildDefaultValues, type FormItem } from '../field-config'
import { useTabbedFormTabValidationState } from '../hooks/use-tabbed-form-tab-validation-state.client'
import { FormActionsBar } from '../chrome/form-actions-bar'
import { getTabPanelElementId, getTabPanelIdPrefix } from './tabbed-form-id.lib'
import { TabbedFormTabIssueBadge } from './tabbed-form-tab-issue-badge.client'
import {
  formFooterSpacingClasses,
  formStickyTabsClasses,
  formTabbedInactivePanelClasses,
  formTabbedNavOverflowClasses,
  formTabPanelsBottomPaddingClasses,
} from '../chrome/form-chrome.variants'
import { warnHeaderOnlyTabValidationWiring } from './warn-header-only-tab-validation-wiring'

/** Accessible name for the TabbedForm section control. */
export const TABBED_FORM_SECTIONS_ARIA_LABEL = 'Form sections'

/** A single tab definition: an id, a display label, and its ordered fields. */
export interface TabbedFormTab {
  id: string
  label: string
  fields: FormItem[]
  /** Optional leading icon for the section control (decorative; pass `aria-hidden`). */
  leadingIcon?: React.ReactNode
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

export interface TabbedFormFooterRegionProps {
  hasFooterRegion: boolean
  stickyChrome: boolean
  stickyActionsBarClassName?: string
  formError?: string | null
  validationSummary?: React.ReactNode
  resolvedFooter: React.ReactNode
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

  const validateSilently = React.useMemo(() => createValidateSilently(resolver), [resolver])

  return { form, validateSilently }
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
    <div
      role="region"
      id={getTabPanelElementId(formId, tab.id)}
      aria-label={tab.label}
      data-tab-panel={tab.id}
      data-state={isActive ? 'active' : 'inactive'}
      className={cn(!isActive && formTabbedInactivePanelClasses)}
    >
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
    </div>
  )
}

function buildTabbedFormSectionOptions(
  tabs: TabbedFormTab[],
  formId: string,
  issueCountForTab: (tabId: string) => number,
): SegmentedControlOption<string>[] {
  return tabs.map((tab) => ({
    value: tab.id,
    label: tab.label,
    leadingIcon: tab.leadingIcon,
    trailing: <TabbedFormTabIssueBadge count={issueCountForTab(tab.id)} />,
    buttonProps: {
      'data-tab-trigger': tab.id,
      'aria-controls': getTabPanelElementId(formId, tab.id),
    },
  }))
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
  const { density } = useFormSectionContext()
  const { rhythm } = resolveFormDensity(density)
  const { tabStates } = useTabbedFormTabValidationState(tabs)
  const tabStateById = React.useMemo(
    () => new Map(tabStates.map((state) => [state.tabId, state])),
    [tabStates],
  )
  const sectionOptions = React.useMemo(
    () =>
      buildTabbedFormSectionOptions(tabs, formId, (tabId) => tabStateById.get(tabId)?.count ?? 0),
    [formId, tabStateById, tabs],
  )
  const panelClassName = cn(
    fieldStackRhythmVariants({ rhythm }),
    stickyChrome && !omitPanelBottomPadding ? formTabPanelsBottomPaddingClasses : undefined,
  )

  return (
    <div className={fieldStackRhythmVariants({ rhythm })}>
      <div
        className={cn(
          formTabbedNavOverflowClasses,
          stickyChrome ? formStickyTabsClasses : undefined,
          stickyTabsClassName,
        )}
      >
        <SegmentedControl
          value={activeTabId}
          options={sectionOptions}
          onValueChange={onActiveTabChange}
          fullWidth
          aria-label={TABBED_FORM_SECTIONS_ARIA_LABEL}
        />
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
    </div>
  )
}

type TabbedFormFooterRegionInternalProps = TabbedFormFooterRegionProps

function TabbedFormFlatFooter({
  formError,
  validationSummary,
  resolvedFooter,
}: Pick<
  TabbedFormFooterRegionInternalProps,
  'formError' | 'validationSummary' | 'resolvedFooter'
>) {
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
  stickyChrome,
  stickyActionsBarClassName,
  formError,
  validationSummary,
  resolvedFooter,
}: TabbedFormFooterRegionInternalProps) {
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
  externalFooter?: boolean,
): string | undefined {
  return cn(externalFooter ? undefined : stickyChrome ? undefined : 'space-y-6', className)
}
