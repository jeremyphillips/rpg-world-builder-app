'use client'

import * as React from 'react'
import type { Control, FieldValues } from 'react-hook-form'
import { useFormState, useWatch } from 'react-hook-form'

import {
  readGroupCollapseOpen,
  writeGroupCollapseOpen,
} from '../../form/config/group-collapse-storage.lib'
import { accordionContentVariants } from './accordion.variants'
import { Button } from './button.client'
import { Collapsible, CollapsibleContent } from './collapsible.client'
import type { FieldGroupSummaryDisclosureChrome } from './field-group-chrome.variants'
import {
  fieldGroupSummaryDisclosureActionButtonClasses,
  fieldGroupSummaryDisclosureHeaderClasses,
  fieldGroupSummaryDisclosurePanelClasses,
} from './field-group-summary-disclosure.variants'
import { Text } from './text'

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

export type FieldGroupSummaryDisclosureProps<TFieldValues extends FieldValues = FieldValues> = {
  legend: string
  panelId: string
  legendId: string
  chrome: FieldGroupSummaryDisclosureChrome
  uiStateKey?: string
  collapseKey: string
  control: Control<TFieldValues>
  children: React.ReactNode
}

/** Collapsed summary + Change / expanded Done chrome for settings-style field groups. */
export function FieldGroupSummaryDisclosure<TFieldValues extends FieldValues = FieldValues>({
  legend,
  panelId,
  legendId,
  chrome,
  uiStateKey,
  collapseKey,
  control,
  children,
}: FieldGroupSummaryDisclosureProps<TFieldValues>) {
  const allValues = useWatch({ control }) as Record<string, unknown>
  const watchedValues = React.useMemo(() => {
    if (!chrome.summaryDependsOn?.length) return allValues
    return chrome.summaryDependsOn.reduce<Record<string, unknown>>((acc, path) => {
      acc[path] = allValues[path]
      return acc
    }, {})
  }, [allValues, chrome.summaryDependsOn])
  const { isDirty } = useFormState({ control })

  const [open, onOpenChange] = useSummaryDisclosureOpenState({
    collapseKey,
    defaultOpen: chrome.defaultOpen ?? false,
    uiStateKey,
  })

  const summary = React.useMemo(() => chrome.resolveSummary(watchedValues), [chrome, watchedValues])

  const openLabel = chrome.openLabel ?? DEFAULT_OPEN_LABEL
  const closeLabel = chrome.closeLabel ?? DEFAULT_CLOSE_LABEL
  const unsavedSuffix = chrome.unsavedSuffix ?? DEFAULT_UNSAVED_SUFFIX
  const showDirtySuffix = chrome.showDirtySuffix && isDirty
  const disabled = chrome.disabled ?? false

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="flex min-w-0 flex-col gap-1">
      {!open ? (
        <>
          <Text id={legendId} variant="muted" className="text-sm">
            {legend}
          </Text>
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              aria-expanded={false}
              aria-controls={panelId}
              disabled={disabled}
              onClick={() => onOpenChange(true)}
            >
              <Text as="span" className="text-sm">
                {summary.primary}
                {showDirtySuffix ? (
                  <Text as="span" variant="muted">
                    {unsavedSuffix}
                  </Text>
                ) : null}
              </Text>
              {summary.secondary ? (
                <Text variant="muted" className="mt-1 text-sm">
                  {summary.secondary}
                </Text>
              ) : null}
            </button>
            <Button
              type="button"
              variant="text"
              size="sm"
              className={fieldGroupSummaryDisclosureActionButtonClasses}
              aria-expanded={false}
              aria-controls={panelId}
              disabled={disabled}
              onClick={() => onOpenChange(true)}
            >
              {openLabel}
            </Button>
          </div>
        </>
      ) : (
        <div className={fieldGroupSummaryDisclosureHeaderClasses}>
          <Text id={legendId} className="text-sm font-medium">
            {legend}
          </Text>
          <Button
            type="button"
            variant="text"
            size="sm"
            className={fieldGroupSummaryDisclosureActionButtonClasses}
            aria-expanded
            aria-controls={panelId}
            disabled={disabled}
            onClick={() => onOpenChange(false)}
          >
            {closeLabel}
          </Button>
        </div>
      )}

      <CollapsibleContent forceMount className={accordionContentVariants()}>
        <div
          id={panelId}
          hidden={!open}
          className={open ? fieldGroupSummaryDisclosurePanelClasses : undefined}
        >
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
