'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Field } from '../../components/ui/field.client'
import type { FieldLabelPlacement } from '../../components/ui/field.variants'
import { FieldLabelContent, FieldLabelLine } from '../../components/ui/field-label-content'
import { resolveOwnedLabelPolicy } from '../../components/ui/field-required.lib'
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
  placement?: FieldLabelPlacement
}

/**
 * Canonical leaf field label. Applies `sr-only` to the naming element only; the
 * info action stays in {@link FieldLabelLine} beside it.
 */
export function FormFieldLabel({
  label,
  labelVisibility,
  required,
  info,
  className,
  id,
  htmlFor,
  placement,
}: FormFieldLabelProps) {
  const visibility = useOwnedLabelVisibility(labelVisibility)
  if (!label.trim()) return null

  const { showRequiredMarker, nameClassName } = resolveOwnedLabelPolicy(required, visibility)

  return (
    <FieldLabelLine label={label} info={info}>
      <Field.Label
        id={id}
        htmlFor={htmlFor}
        placement={placement}
        className={cn(nameClassName, className)}
      >
        <FieldLabelContent label={label} showRequiredMarker={showRequiredMarker} />
      </Field.Label>
    </FieldLabelLine>
  )
}
