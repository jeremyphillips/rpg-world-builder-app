import type { ReactNode } from 'react'

import { FieldLabelContent } from './field-label-content'
import { shouldShowVisibleRequiredMarker } from './field-required.lib'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'

export function CheckboxFieldOptionLabel({
  label,
  labelVisibility,
  required,
  info,
}: {
  label: string
  labelVisibility: FieldLabelVisibility
  required?: boolean
  info?: ReactNode
}) {
  const showRequiredMarker = shouldShowVisibleRequiredMarker(required, labelVisibility)
  const content = (
    <FieldLabelContent
      label={label}
      required={required}
      showRequiredMarker={showRequiredMarker}
      info={labelVisibility === 'srOnly' ? undefined : info}
    />
  )

  if (labelVisibility === 'srOnly') {
    return <span className="sr-only">{content}</span>
  }

  return content
}
