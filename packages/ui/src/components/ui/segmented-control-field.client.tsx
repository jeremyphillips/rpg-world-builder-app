'use client'

import type { ReactNode } from 'react'

import type { FieldHintPosition } from './field.variants'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldChrome } from './field-chrome.variants'
import type { FieldValidationProps } from './field-validation-props'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import type { FieldLabelPresentationProps } from './field-label-props'
import type { FieldOption } from '../../form/field-config'
import { cn } from '../../lib/utils'
import { SegmentedControl, type SegmentedControlSize } from './segmented-control.client'
import { RadioFieldShell } from './radio-field-shell'

function resolveSegmentedControlSize(fieldSize: FieldSize | undefined): SegmentedControlSize {
  if (fieldSize === 'xs' || fieldSize === 'sm') return 'sm'
  return 'default'
}

export interface SegmentedControlFieldProps
  extends FieldValidationProps, FieldLabelPresentationProps {
  id: string
  options: FieldOption[]
  hint?: string
  hintPosition?: FieldHintPosition
  info?: ReactNode
  required?: boolean
  size?: FieldSize
  width?: FieldWidth
  disabled?: boolean
  labelVisibility?: FieldLabelVisibility
  chrome?: FieldChrome
  value?: string
  onValueChange?: (value: string) => void
  onBlur?: () => void
  fullWidth?: boolean
}

export function SegmentedControlField({
  id,
  label,
  options,
  error,
  invalid,
  describedBy,
  hint,
  hintPosition,
  info,
  required,
  size,
  width,
  disabled,
  value,
  onValueChange,
  onBlur,
  labelVisibility,
  chrome,
  fullWidth = false,
}: SegmentedControlFieldProps) {
  const selected = value != null && value !== '' ? value : null

  return (
    <RadioFieldShell
      id={id}
      label={label}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      hint={hint}
      hintPosition={hintPosition}
      info={info}
      required={required}
      size={size}
      width={fullWidth ? 'full' : width}
      labelVisibility={labelVisibility}
      chrome={chrome}
    >
      {(labelId) => (
        <div className={cn(fullWidth && 'w-full min-w-0')} onBlur={onBlur}>
          <SegmentedControl
            value={selected}
            options={options.map((option) => ({
              value: option.value,
              label: option.label,
              disabled: option.disabled,
            }))}
            aria-labelledby={labelId}
            disabled={disabled}
            fullWidth={fullWidth}
            segmentWidth={fullWidth ? 'equal' : 'auto'}
            size={resolveSegmentedControlSize(size)}
            onValueChange={(next) => {
              onValueChange?.(next)
            }}
          />
        </div>
      )}
    </RadioFieldShell>
  )
}
