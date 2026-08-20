'use client'

import * as React from 'react'
import type { Control, FieldValues } from 'react-hook-form'
import { useFormState, useWatch } from 'react-hook-form'

import {
  readGroupCollapseOpen,
  writeGroupCollapseOpen,
} from '../../form/config/group-collapse-storage.lib'
import { accordionContentVariants } from './accordion.variants'
import { resolveChromeClasses } from './chrome.variants'
import { Collapsible, CollapsibleContent } from './collapsible.client'
import type { FieldSize } from './field.client'
import type { FieldGroupSummary, FieldGroupSummaryDisclosure } from './field-group-disclosure.types'
import { FieldGroupSummaryDisclosureCollapsed } from './field-group-summary-disclosure-collapsed.client'
import { FieldGroupSummaryDisclosureExpandedHeader } from './field-group-summary-disclosure-expanded-header.client'
import { resolveFieldGroupSummaryDisclosurePanelClasses } from './field-group-summary-disclosure.variants'

const DEFAULT_OPEN_LABEL = 'Change'
const DEFAULT_CLOSE_LABEL = 'Done'
const DEFAULT_UNSAVED_SUFFIX = ' · Unsaved'

function useSummaryDisclosureOpenState(options: {
  collapseKey: string
  defaultOpen: boolean
  uiStateKey?: string
}): [boolean, (open: boolean) => void] {
  const [open, setOpen] = React.useState(() => {
    if (options.uiStateKey) {
      const stored = readGroupCollapseOpen(options.uiStateKey, options.collapseKey)
      if (stored !== undefined) return stored
    }
    return options.defaultOpen
  })

  const onOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next)
      if (options.uiStateKey) {
        writeGroupCollapseOpen(options.uiStateKey, options.collapseKey, next)
      }
    },
    [options.collapseKey, options.uiStateKey],
  )

  return [open, onOpenChange]
}

function useSummaryDisclosureWatchedValues<TFieldValues extends FieldValues>(
  control: Control<TFieldValues>,
  summaryDependsOn: readonly string[] | undefined,
): Record<string, unknown> {
  const allValues = useWatch({ control }) as Record<string, unknown>
  return React.useMemo(() => {
    if (!summaryDependsOn?.length) return allValues
    return summaryDependsOn.reduce<Record<string, unknown>>((acc, path) => {
      acc[path] = allValues[path]
      return acc
    }, {})
  }, [allValues, summaryDependsOn])
}

export type FieldGroupSummaryDisclosureProps<TFieldValues extends FieldValues = FieldValues> = {
  legend: string
  panelId: string
  legendId: string
  size?: FieldSize
  disclosure: FieldGroupSummaryDisclosure
  uiStateKey?: string
  collapseKey: string
  control: Control<TFieldValues>
  children: React.ReactNode
}

function FieldGroupSummaryDisclosureHeader({
  open,
  legend,
  legendId,
  panelId,
  size,
  closeLabel,
  openLabel,
  unsavedSuffix,
  showDirtySuffix,
  disabled,
  summary,
  collapsedChromeClasses,
  onOpenChange,
}: {
  open: boolean
  legend: string
  legendId: string
  panelId: string
  size: FieldSize
  closeLabel: string
  openLabel: string
  unsavedSuffix: string
  showDirtySuffix: boolean
  disabled: boolean
  summary: FieldGroupSummary
  collapsedChromeClasses: string | undefined
  onOpenChange: (open: boolean) => void
}) {
  if (open) {
    return (
      <FieldGroupSummaryDisclosureExpandedHeader
        legend={legend}
        legendId={legendId}
        panelId={panelId}
        size={size}
        closeLabel={closeLabel}
        disabled={disabled}
        onClose={() => onOpenChange(false)}
      />
    )
  }

  const collapsed = (
    <FieldGroupSummaryDisclosureCollapsed
      legend={legend}
      legendId={legendId}
      panelId={panelId}
      size={size}
      summary={summary}
      openLabel={openLabel}
      unsavedSuffix={unsavedSuffix}
      showDirtySuffix={showDirtySuffix}
      disabled={disabled}
      onOpen={() => onOpenChange(true)}
    />
  )

  return collapsedChromeClasses ? (
    <div className={collapsedChromeClasses} data-summary-chrome>
      {collapsed}
    </div>
  ) : (
    collapsed
  )
}

/** Collapsed summary + Change / expanded Done chrome for settings-style field groups. */
export function FieldGroupSummaryDisclosure<TFieldValues extends FieldValues = FieldValues>({
  legend,
  panelId,
  legendId,
  size = 'md',
  disclosure,
  uiStateKey,
  collapseKey,
  control,
  children,
}: FieldGroupSummaryDisclosureProps<TFieldValues>) {
  const watchedValues = useSummaryDisclosureWatchedValues(control, disclosure.summaryDependsOn)
  const { isDirty } = useFormState({ control })
  const [open, onOpenChange] = useSummaryDisclosureOpenState({
    collapseKey,
    defaultOpen: disclosure.defaultOpen ?? false,
    uiStateKey,
  })

  const summary = React.useMemo(
    () => disclosure.resolveSummary(watchedValues),
    [disclosure, watchedValues],
  )

  const openLabel = disclosure.openLabel ?? DEFAULT_OPEN_LABEL
  const closeLabel = disclosure.closeLabel ?? DEFAULT_CLOSE_LABEL
  const unsavedSuffix = disclosure.unsavedSuffix ?? DEFAULT_UNSAVED_SUFFIX
  const showDirtySuffix = Boolean(disclosure.showDirtySuffix && isDirty)
  const disabled = disclosure.disabled ?? false
  const panelClasses = open
    ? resolveFieldGroupSummaryDisclosurePanelClasses(disclosure.panelDivider ?? true)
    : undefined
  const collapsedChromeClasses = !open ? resolveChromeClasses(summary.chrome) : undefined

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="flex min-w-0 flex-col gap-1">
      <FieldGroupSummaryDisclosureHeader
        open={open}
        legend={legend}
        legendId={legendId}
        panelId={panelId}
        size={size}
        closeLabel={closeLabel}
        openLabel={openLabel}
        unsavedSuffix={unsavedSuffix}
        showDirtySuffix={showDirtySuffix}
        disabled={disabled}
        summary={summary}
        collapsedChromeClasses={collapsedChromeClasses}
        onOpenChange={onOpenChange}
      />

      <CollapsibleContent forceMount className={accordionContentVariants()}>
        <div id={panelId} hidden={!open} className={panelClasses}>
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
