'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Field } from '../../components/ui/field.client'
import { FieldLabelContent, FieldLabelInfoAction } from '../../components/ui/field-label-content'
import { shouldShowVisibleRequiredMarker } from '../../components/ui/field-required.lib'
import { useOwnedLabelVisibility } from '../../components/ui/owned-label-visibility.lib'
import type { FieldLabelVisibility } from '../form-heading.lib'

export interface FormFieldLabelProps {
  label: string
  /** Explicit override. Omitted values read the owning `Field.Root`. */
  labelVisibility?: FieldLabelVisibility
  required?: boolean
  info?: ReactNode
  className?: string
  id?: string
  htmlFor?: string
}

/**
 * Canonical leaf field label. Applies `sr-only` to the text only; an info
 * action stays outside that wrapper so it remains visible and focusable.
 */
export function FormFieldLabel({
  label,
  labelVisibility,
  required,
  info,
  className,
  id,
  htmlFor,
}: FormFieldLabelProps) {
  const visibility = useOwnedLabelVisibility(labelVisibility)
  if (!label.trim()) return null

  const text = (
    <Field.Label
      id={id}
      htmlFor={htmlFor}
      className={cn(visibility === 'srOnly' && 'sr-only', className)}
    >
      <FieldLabelContent
        label={label}
        required={required}
        showRequiredMarker={shouldShowVisibleRequiredMarker(required, visibility)}
        info={visibility === 'srOnly' ? undefined : info}
      />
    </Field.Label>
  )

  if (visibility !== 'srOnly' || info == null) return text

  return (
    <>
      {text}
      <FieldLabelInfoAction label={label} info={info} />
    </>
  )
}
