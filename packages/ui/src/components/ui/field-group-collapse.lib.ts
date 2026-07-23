import type { Control, FieldValues } from 'react-hook-form'

import { slugifyGroupCollapseKey } from '../../form/config/group-collapse-storage.lib'
import type { FieldGroupDisclosure } from './field-group-disclosure.types'

export function resolveFieldGroupCollapseKey(options: {
  disclosure?: FieldGroupDisclosure
  collapseKey?: string
  id?: string
  legend?: string
}): string {
  return (
    options.disclosure?.collapseKey ??
    options.collapseKey ??
    options.id ??
    (options.legend ? slugifyGroupCollapseKey(options.legend) || 'group-section' : 'group-section')
  )
}

export function validateSummaryDisclosureRequirements(
  legend: string | undefined,
  formControl: Control<FieldValues> | undefined,
): { legend: string; formControl: Control<FieldValues> } {
  if (!legend) {
    throw new Error('FieldGroup summary disclosure requires a legend.')
  }
  if (!formControl) {
    throw new Error('FieldGroup summary disclosure requires formControl from FormProvider.')
  }

  return { legend, formControl }
}
