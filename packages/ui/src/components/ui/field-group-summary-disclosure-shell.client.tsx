'use client'

import type { ReactNode } from 'react'
import type { Control, FieldValues } from 'react-hook-form'

import { cn } from '../../lib/utils'
import type { FieldGroupChromeClassNames } from './field-group-chrome.variants'
import { FieldGroupSummaryDisclosure } from './field-group-summary-disclosure.client'
import {
  fieldGroupBottomMarginClasses,
  fieldSetResetClasses,
  fieldStackRhythmVariants,
  type FieldStackRhythm,
} from './field.variants'

export type SummaryDisclosureFieldGroupShellProps = {
  id?: string
  legend: string
  rhythm: FieldStackRhythm
  className?: string
  uiStateKey?: string
  collapseKey: string
  chromeClasses: FieldGroupChromeClassNames
  formControl: Control<FieldValues>
  children: ReactNode
}

/** Fieldset wrapper for groups using summaryDisclosure chrome. */
export function SummaryDisclosureFieldGroupShell({
  id,
  legend,
  rhythm,
  className,
  uiStateKey,
  collapseKey,
  chromeClasses,
  formControl,
  children,
}: SummaryDisclosureFieldGroupShellProps) {
  const legendId = `${id ?? collapseKey}-legend`
  const panelId = `${id ?? collapseKey}-panel`
  const summaryDisclosure = chromeClasses.summaryDisclosure

  if (!summaryDisclosure) {
    throw new Error('FieldGroup summaryDisclosure chrome is missing.')
  }

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
      <FieldGroupSummaryDisclosure
        legend={legend}
        legendId={legendId}
        panelId={panelId}
        chrome={summaryDisclosure}
        uiStateKey={uiStateKey}
        collapseKey={collapseKey}
        control={formControl}
      >
        <div className={cn(fieldStackRhythmVariants({ rhythm }), chromeClasses.body)}>
          {children}
        </div>
      </FieldGroupSummaryDisclosure>
    </fieldset>
  )
}
