'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Field } from '../../components/ui/field.client'
import { FieldLabelContent } from '../../components/ui/field-label-content'
import type { FieldLabelVisibility } from '../form-heading.lib'

export interface FormFieldLabelProps {
  label: string
  labelVisibility?: FieldLabelVisibility
  required?: boolean
  info?: ReactNode
  className?: string
}

/**
 * Canonical leaf field label — all scalar/select/radio/checkbox renderers route here.
 * Applies `sr-only` via the shared utility; never omits the accessible name.
 */
export function FormFieldLabel({
  label,
  labelVisibility = 'visible',
  required,
  info,
  className,
}: FormFieldLabelProps) {
  if (!label.trim()) return null

  return (
    <Field.Label className={cn(labelVisibility === 'srOnly' && 'sr-only', className)}>
      <FieldLabelContent label={label} required={required} info={info} />
    </Field.Label>
  )
}
