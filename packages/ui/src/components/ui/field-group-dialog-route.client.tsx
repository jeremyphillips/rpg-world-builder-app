import type { ReactNode } from 'react'
import type { Control, FieldValues } from 'react-hook-form'

import type { FieldSize } from './field.client'
import type { FieldGroupDialogDisclosure } from './field-group-disclosure.types'
import { validateSummaryDisclosureRequirements } from './field-group-collapse.lib'
import { FieldGroupDialogDisclosure as FieldGroupDialogDisclosureView } from './field-group-dialog-disclosure.client'
import type { FieldRhythm } from './field.variants'
import { resolveFormDensity } from '../../form/form-density'

export type FieldGroupDialogRouteProps = {
  id?: string
  legend?: string
  size?: FieldSize
  rhythm: FieldRhythm
  className?: string
  collapseKey: string
  disclosure: FieldGroupDialogDisclosure
  formControl?: Control<FieldValues>
  children: ReactNode
}

/** Renders dialog-disclosure groups after validating legend + form control. */
export function FieldGroupDialogRoute({
  id,
  legend,
  size,
  rhythm,
  className,
  collapseKey,
  disclosure,
  formControl,
  children,
}: FieldGroupDialogRouteProps) {
  const { legend: resolvedLegend, formControl: resolvedFormControl } =
    validateSummaryDisclosureRequirements(legend, formControl)
  const resolvedSize = size ?? resolveFormDensity('compact').size
  const legendId = `${id ?? collapseKey}-legend`
  const panelId = `${id ?? collapseKey}-panel`

  return (
    <FieldGroupDialogDisclosureView
      legend={resolvedLegend}
      legendId={legendId}
      panelId={panelId}
      size={resolvedSize}
      rhythm={rhythm}
      className={className}
      disclosure={disclosure}
      control={resolvedFormControl}
    >
      {children}
    </FieldGroupDialogDisclosureView>
  )
}
