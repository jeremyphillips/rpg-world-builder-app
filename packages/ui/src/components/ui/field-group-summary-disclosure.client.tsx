'use client'

import * as React from 'react'
import type { Control, FieldValues } from 'react-hook-form'
import { useFormState } from 'react-hook-form'

import {
  readGroupCollapseOpen,
  writeGroupCollapseOpen,
} from '../../form/config/group-collapse-storage.lib'
import { accordionContentVariants } from './accordion.variants'
import { Button } from './button.client'
import { Collapsible, CollapsibleContent } from './collapsible.client'
import { DEFAULT_FIELD_CHROME } from './field-chrome.variants'
import { FieldChromeShell } from './field-chrome-shell'
import type { FieldSize } from './field.client'
import type { FieldGroupSummary, FieldGroupSummaryDisclosure } from './field-group-disclosure.types'
import { FieldGroupSummaryDisclosureCollapsed } from './field-group-summary-disclosure-collapsed.client'
import { FieldGroupSummaryDisclosureExpandedHeader } from './field-group-summary-disclosure-expanded-header.client'
import {
  fieldGroupSummaryDisclosureFooterClasses,
  resolveFieldGroupSummaryDisclosurePanelClasses,
} from './field-group-summary-disclosure.variants'
import {
  DEFAULT_SUMMARY_CLOSE_LABEL,
  DEFAULT_SUMMARY_OPEN_LABEL,
  DEFAULT_SUMMARY_UNSAVED_SUFFIX,
  useSummaryDisclosureWatchedValues,
} from './field-group-summary-watch.lib'
import { fieldStackRhythmVariants, type FieldRhythm } from './field.variants'
import { cn } from '../../lib/utils'

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

export type FieldGroupSummaryDisclosureProps<TFieldValues extends FieldValues = FieldValues> = {
  legend: string
  panelId: string
  legendId: string
  size?: FieldSize
  rhythm?: FieldRhythm
  chromeBodyClassName?: string
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
  openLabel,
  unsavedSuffix,
  showDirtySuffix,
  disabled,
  summary,
  onOpenChange,
}: {
  open: boolean
  legend: string
  legendId: string
  panelId: string
  size: FieldSize
  openLabel: string
  unsavedSuffix: string
  showDirtySuffix: boolean
  disabled: boolean
  summary: FieldGroupSummary
  onOpenChange: (open: boolean) => void
}) {
  if (open) {
    return (
      <FieldGroupSummaryDisclosureExpandedHeader legend={legend} legendId={legendId} size={size} />
    )
  }

  return (
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
}

function FieldGroupSummaryDisclosurePanel({
  size,
  rhythm,
  chromeBodyClassName,
  closeLabel,
  disabled,
  panelId,
  children,
  onClose,
}: {
  size: FieldSize
  rhythm: FieldRhythm
  chromeBodyClassName?: string
  closeLabel: string
  disabled: boolean
  panelId: string
  children: React.ReactNode
  onClose: () => void
}) {
  const footer = (
    <div className={fieldGroupSummaryDisclosureFooterClasses}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-expanded
        aria-controls={panelId}
        disabled={disabled}
        onClick={onClose}
      >
        {closeLabel}
      </Button>
    </div>
  )

  const body = (
    <>
      {children}
      {footer}
    </>
  )

  if (chromeBodyClassName) {
    return (
      <div className={cn(chromeBodyClassName, fieldStackRhythmVariants({ rhythm }))}>{body}</div>
    )
  }

  return (
    <FieldChromeShell
      chrome={DEFAULT_FIELD_CHROME}
      size={size}
      className={fieldStackRhythmVariants({ rhythm })}
    >
      {body}
    </FieldChromeShell>
  )
}

/** Collapsed summary + Change / expanded Done chrome for settings-style field groups. */
export function FieldGroupSummaryDisclosure<TFieldValues extends FieldValues = FieldValues>({
  legend,
  panelId,
  legendId,
  size = 'md',
  rhythm = 'compact',
  chromeBodyClassName,
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

  const openLabel = disclosure.openLabel ?? DEFAULT_SUMMARY_OPEN_LABEL
  const closeLabel = disclosure.closeLabel ?? DEFAULT_SUMMARY_CLOSE_LABEL
  const unsavedSuffix = disclosure.unsavedSuffix ?? DEFAULT_SUMMARY_UNSAVED_SUFFIX
  const showDirtySuffix = Boolean(disclosure.showDirtySuffix && isDirty)
  const disabled = disclosure.disabled ?? false
  const panelClasses = open
    ? resolveFieldGroupSummaryDisclosurePanelClasses(disclosure.panelDivider ?? true)
    : undefined

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="flex min-w-0 flex-col gap-1">
      <FieldGroupSummaryDisclosureHeader
        open={open}
        legend={legend}
        legendId={legendId}
        panelId={panelId}
        size={size}
        openLabel={openLabel}
        unsavedSuffix={unsavedSuffix}
        showDirtySuffix={showDirtySuffix}
        disabled={disabled}
        summary={summary}
        onOpenChange={onOpenChange}
      />

      <CollapsibleContent forceMount className={accordionContentVariants()}>
        <div id={panelId} hidden={!open} className={panelClasses}>
          <FieldGroupSummaryDisclosurePanel
            size={size}
            rhythm={rhythm}
            chromeBodyClassName={chromeBodyClassName}
            closeLabel={closeLabel}
            disabled={disabled}
            panelId={panelId}
            onClose={() => onOpenChange(false)}
          >
            {children}
          </FieldGroupSummaryDisclosurePanel>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
