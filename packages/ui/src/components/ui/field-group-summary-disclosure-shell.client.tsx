'use client'

import type { ReactNode } from 'react'
import type { Control, FieldValues } from 'react-hook-form'

import { cn } from '../../lib/utils'
import type { FieldGroupChromeClassNames } from './field-group-chrome.variants'
import type { FieldGroupSummaryDisclosure } from './field-group-disclosure.types'
import { FieldGroupSummaryDisclosure as FieldGroupSummaryDisclosureView } from './field-group-summary-disclosure.client'
import {
  fieldGroupBottomMarginClasses,
  fieldSetResetClasses,
  fieldStackRhythmVariants,
  type FieldRhythm,
} from './field.variants'

export type SummaryDisclosureFieldGroupShellProps = {
  id?: string
  legend: string
  rhythm: FieldRhythm
  className?: string
  uiStateKey?: string
  collapseKey: string
  chromeClasses: FieldGroupChromeClassNames
  disclosure: FieldGroupSummaryDisclosure
  formControl: Control<FieldValues>
  children: ReactNode
}

/** Fieldset wrapper for groups using summary disclosure. */
export function SummaryDisclosureFieldGroupShell({
  id,
  legend,
  rhythm,
  className,
  uiStateKey,
  collapseKey,
  chromeClasses,
  disclosure,
  formControl,
  children,
}: SummaryDisclosureFieldGroupShellProps) {
  const legendId = `${id ?? collapseKey}-legend`
  const panelId = `${id ?? collapseKey}-panel`

  return (
    <fieldset
      id={id}
      aria-labelledby={legendId}
      className={cn(
        fieldSetResetClasses,
        fieldGroupBottomMarginClasses,
        'min-w-0',
        chromeClasses.fieldset,
        className,
      )}
    >
      <FieldGroupSummaryDisclosureView
        legend={legend}
        legendId={legendId}
        panelId={panelId}
        disclosure={disclosure}
        uiStateKey={uiStateKey}
        collapseKey={collapseKey}
        control={formControl}
      >
        <div className={cn(fieldStackRhythmVariants({ rhythm }), chromeClasses.body)}>
          {children}
        </div>
      </FieldGroupSummaryDisclosureView>
    </fieldset>
  )
}
