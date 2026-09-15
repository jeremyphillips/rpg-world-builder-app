'use client'

import { useFormState } from 'react-hook-form'

import { FieldErrorText } from '../../../components/ui/field.client'
import { useFieldErrorPresentation } from '../../context/array-item-presentation.context'
import { resolveNestedFieldErrorMessage } from '../../errors/resolve-field-error-message'

export interface ArrayFieldContainerErrorProps {
  fullName: string
  errorId: string
  size?: 'sm' | 'md' | 'lg'
}

/** Container-level array validation message — separate from the neutral empty-state panel. */
export function ArrayFieldContainerError({
  fullName,
  errorId,
  size = 'sm',
}: ArrayFieldContainerErrorProps) {
  const { errors } = useFormState()
  const rhfMessage = resolveNestedFieldErrorMessage(errors, fullName)
  const { error } = useFieldErrorPresentation(rhfMessage, fullName)
  if (!error) return null

  return (
    <FieldErrorText id={errorId} size={size}>
      {error}
    </FieldErrorText>
  )
}
