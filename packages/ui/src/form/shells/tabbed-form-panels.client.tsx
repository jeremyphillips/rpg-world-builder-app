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
import { buildDefaultValues } from '../field-config'
import { useTabbedFormTabValidationState } from '../hooks/use-tabbed-form-tab-validation-state.client'
import { FormActionsBar, type FormActionsBarPlacement } from '../chrome/form-actions-bar'
import { getTabPanelElementId, getTabPanelIdPrefix } from './tabbed-form-id.lib'
import { TabbedFormTabIssueBadge } from './tabbed-form-tab-issue-badge.client'
import {
  formFooterSpacingClasses,
  formStickyTabsClasses,
  formTabbedInactivePanelClasses,
  formTabbedNavControlWrapClasses,
  formTabbedNavOverflowClasses,
  formTabbedNavWithTrailingClasses,
} from '../chrome/form-chrome.variants'
import { warnHeaderOnlyTabValidationWiring } from './warn-header-only-tab-validation-wiring'
import { collectTabbedFormResolverItems, type TabbedFormTab } from './tabbed-form-panels.lib'

export type { TabbedFormTab }
export { collectTabbedFormResolverItems }

/** Accessible name for the TabbedForm section control. */
export const TABBED_FORM_SECTIONS_ARIA_LABEL = 'Form sections'

export interface TabbedFormFooterRegionProps {
  hasFooterRegion: boolean
  stickyChrome: boolean
  stickyActionsBarClassName?: string
  actionsBarPlacement?: FormActionsBarPlacement
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
  /** Trailing control on the sticky tab row (hidden by the consumer below `xl` as needed). */
  tabRowTrailing?: React.ReactNode
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
  tabRowTrailing,
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
  const panelClassName = fieldStackRhythmVariants({ rhythm })
  const sectionControl = (
    <SegmentedControl
      value={activeTabId}
      options={sectionOptions}
      onValueChange={onActiveTabChange}
      fullWidth
      aria-label={TABBED_FORM_SECTIONS_ARIA_LABEL}
    />
  )

  return (
    <div className={fieldStackRhythmVariants({ rhythm })}>
      <div
        className={cn(
          tabRowTrailing ? formTabbedNavWithTrailingClasses : formTabbedNavOverflowClasses,
          stickyChrome ? formStickyTabsClasses : undefined,
          stickyTabsClassName,
        )}
      >
        {tabRowTrailing ? (
          <>
            <div className={formTabbedNavControlWrapClasses}>{sectionControl}</div>
            {tabRowTrailing}
          </>
        ) : (
          sectionControl
        )}
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
  actionsBarPlacement = 'sticky',
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
        placement={actionsBarPlacement}
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
