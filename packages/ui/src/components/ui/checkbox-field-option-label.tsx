import type { ReactNode } from 'react'

import { FieldLabelContent } from './field-label-content'
import { resolveOwnedLabelPolicy } from './field-required.lib'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'

export function CheckboxFieldOptionLabel({
  label,
  labelVisibility,
  required,
}: {
  label: string
  labelVisibility: FieldLabelVisibility
  required?: boolean
  info?: ReactNode
}) {
  const { showRequiredMarker, nameClassName } = resolveOwnedLabelPolicy(required, labelVisibility)
  const content = <FieldLabelContent label={label} showRequiredMarker={showRequiredMarker} />

  if (nameClassName) {
    return <span className={nameClassName}>{content}</span>
  }

  return content
}
