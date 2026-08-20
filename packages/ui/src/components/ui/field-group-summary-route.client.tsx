import type { Control, FieldValues } from 'react-hook-form'

import type { FieldSize } from './field.client'
import type { FieldGroupChromeClassNames } from './field-group-chrome.variants'
import type { FieldGroupSummaryDisclosure } from './field-group-disclosure.types'
import { validateSummaryDisclosureRequirements } from './field-group-collapse.lib'
import { SummaryDisclosureFieldGroupShell } from './field-group-summary-disclosure-shell.client'
import type { FieldRhythm } from './field.variants'
import { resolveFormDensity } from '../../form/form-density'

export type FieldGroupSummaryRouteProps = {
  id?: string
  legend?: string
  size?: FieldSize
  rhythm: FieldRhythm
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
  size,
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
  const resolvedSize = size ?? resolveFormDensity('compact').size

  return (
    <SummaryDisclosureFieldGroupShell
      id={id}
      legend={resolvedLegend}
      size={resolvedSize}
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
