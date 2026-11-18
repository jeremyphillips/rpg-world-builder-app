'use client'

import * as React from 'react'

import { Field, type FieldSize, useFieldRootContext } from './field.client'
import { type FieldWidth } from './field-control.variants'
import { resolveFieldAnatomyWidth, type FieldChrome } from './field-chrome.variants'
import { fieldAnatomyIds } from './choose-count-field.lib'
import { type FieldHintPosition } from './field.variants'
import { FieldRadiogroupLabel } from './field-label-content'
import { FieldLayout } from './field-layout'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'

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
  chrome?: FieldChrome
  labelVisibility?: FieldLabelVisibility
  children: (anatomy: ChooseCountFieldAnatomy) => React.ReactNode
}

/** Group shell for inline choose-count composites. The visible name is a field label, not a legend. */
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
  chrome,
  labelVisibility = 'visible',
  children,
}: ChooseCountFieldShellProps) {
  const { chooseId, hintId, errorId } = fieldAnatomyIds(id)
  const labelId = `${id}-label`
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)

  return (
    <Field.Root
      id={id}
      error={error}
      hint={hint}
      hintPosition={hintPosition}
      required={required}
      size={size}
      width={rootWidth}
      labelVisibility={labelVisibility}
      anatomy
    >
      <FieldLayout
        wrapControl={false}
        chrome={chrome}
        size={size}
        controlBand="content-sized"
        label={
          <FieldRadiogroupLabel
            id={labelId}
            label={label}
            required={required}
            info={info}
            size={size}
          />
        }
        control={
          <ChooseCountGroup labelId={labelId} disabled={disabled}>
            {children({ legendId: labelId, chooseId, hintId, errorId })}
          </ChooseCountGroup>
        }
      />
    </Field.Root>
  )
}

function ChooseCountGroup({
  labelId,
  disabled,
  children,
}: {
  labelId: string
  disabled?: boolean
  children: React.ReactNode
}) {
  const { describedBy, hasError } = useFieldRootContext('ChooseCountFieldShell')
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      aria-invalid={hasError || undefined}
      aria-disabled={disabled || undefined}
    >
      {children}
    </div>
  )
}
