'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  FieldErrorText,
  FieldHintBelowLabel,
  FieldHintErrorBelowControl,
  type FieldSize,
} from './field.client'
import { fieldWidthVariants, type FieldWidth } from './field-control.variants'
import { fieldAnatomyIds, fieldDescribedBy } from './choose-count-field.lib'
import {
  fieldAnatomyStackClasses,
  fieldLabelVariants,
  fieldSetResetClasses,
  type FieldHintPosition,
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
  hintPosition?: FieldHintPosition
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
  hintPosition = 'below-label',
  info,
  required,
  disabled,
  size = 'md',
  width = 'full',
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
      className={cn(fieldSetResetClasses, fieldAnatomyStackClasses, fieldWidthVariants({ width }))}
    >
      <legend
        id={legendId}
        data-required={required || undefined}
        className={cn(fieldLabelVariants({ size }), hideLabel && 'sr-only')}
      >
        <FieldLabelContent label={label} info={info} />
      </legend>
      {hintPosition === 'below-label' ? (
        <FieldHintBelowLabel hint={hint} error={error} hintId={hintId} />
      ) : null}
      {children({ legendId, chooseId, hintId, errorId })}
      {hintPosition === 'below-label' ? (
        error ? (
          <FieldErrorText id={errorId} size={size}>
            {error}
          </FieldErrorText>
        ) : null
      ) : (
        <FieldHintErrorBelowControl
          hint={hint}
          error={error}
          hintId={hintId}
          errorId={errorId}
          size={size}
        />
      )}
    </fieldset>
  )
}
