'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import { fieldAnatomyIds, fieldDescribedBy } from './choose-count-field.lib'
import {
  fieldAnatomyStackClasses,
  fieldLabelVariants,
  fieldSetResetClasses,
} from './field.variants'
import { FieldLabelContent } from './field-label-content'

export interface ChooseCountFieldAnatomy {
  legendId: string
  chooseId: string
  hintId: string
  errorId: string
}

interface ChooseCountFieldShellProps {
  id: string
  label: string
  error?: string
  hint?: string
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  width?: FieldWidth
  hideLabel?: boolean
  children: (anatomy: ChooseCountFieldAnatomy) => React.ReactNode
}

/** Shared fieldset + legend wrapper for inline choose-count composite fields. */
export function ChooseCountFieldShell({
  id,
  label,
  error,
  hint,
  info,
  required,
  disabled,
  size = 'md',
  width,
  hideLabel = false,
  children,
}: ChooseCountFieldShellProps) {
  const { legendId, chooseId, hintId, errorId } = fieldAnatomyIds(id)
  const describedBy = fieldDescribedBy(error, hint, errorId, hintId)

  return (
    <fieldset
      id={id}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
      disabled={disabled}
      className={cn(
        fieldSetResetClasses,
        fieldAnatomyStackClasses,
        width === 'auto' ? 'w-auto' : 'w-full',
      )}
    >
      <legend
        id={legendId}
        data-required={required || undefined}
        className={cn(fieldLabelVariants({ size }), hideLabel && 'sr-only')}
      >
        <FieldLabelContent label={label} info={info} />
      </legend>
      {children({ legendId, chooseId, hintId, errorId })}
    </fieldset>
  )
}
