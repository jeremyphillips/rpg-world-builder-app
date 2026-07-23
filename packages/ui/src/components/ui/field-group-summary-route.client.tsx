import type { Control, FieldValues } from 'react-hook-form'

import type { FieldGroupChromeClassNames } from './field-group-chrome.variants'
import type { FieldGroupSummaryDisclosure } from './field-group-disclosure.types'
import { validateSummaryDisclosureRequirements } from './field-group-collapse.lib'
import { SummaryDisclosureFieldGroupShell } from './field-group-summary-disclosure-shell.client'
import type { FieldStackRhythm } from './field.variants'

export type FieldGroupSummaryRouteProps = {
  id?: string
  legend?: string
  rhythm: FieldStackRhythm
  className?: string
  uiStateKey?: string
  collapseKey: string
  chromeClasses: FieldGroupChromeClassNames
  disclosure: FieldGroupSummaryDisclosure
  formControl?: Control<FieldValues>
  children: React.ReactNode
}

/** Renders summary-disclosure groups after validating legend + form control. */
export function FieldGroupSummaryRoute({
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
}: FieldGroupSummaryRouteProps) {
  const { legend: resolvedLegend, formControl: resolvedFormControl } =
    validateSummaryDisclosureRequirements(legend, formControl)

  return (
    <SummaryDisclosureFieldGroupShell
      id={id}
      legend={resolvedLegend}
      rhythm={rhythm}
      className={className}
      uiStateKey={uiStateKey}
      collapseKey={collapseKey}
      chromeClasses={chromeClasses}
      disclosure={disclosure}
      formControl={resolvedFormControl}
    >
      {children}
    </SummaryDisclosureFieldGroupShell>
  )
}
