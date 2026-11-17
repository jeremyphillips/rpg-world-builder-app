'use client'

import { forwardRef, useId, useState, type FocusEventHandler, type ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { TEXT_VARIANT_MAP } from './text.variants'
import { useFieldControlSize } from '../../form/context/form-section.context'
import { useOptionalFilterChrome } from '../../filters/filter-chrome.context'
import { Checkbox } from './checkbox.client'
import { resolveBooleanFieldScale, type BooleanFieldScale } from './boolean-field.lib'
import type { ChoiceTone } from './choice-control.styles'

export const UI_BOOLEAN_FIELD_CLASS = 'ui-boolean-field' as const

export type BooleanFieldProps = {
  id?: string
  label: ReactNode
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  tone?: ChoiceTone
  /** Explicit scale. Heading placement and card density still follow the CSS cascade. */
  size?: BooleanFieldScale
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  name?: string
  className?: string
  /** Marks the field as a filter-toolbar alignment anchor. */
  toolbarAlign?: boolean
  onBlur?: FocusEventHandler<HTMLButtonElement>
}

export const BooleanField = forwardRef<HTMLButtonElement, BooleanFieldProps>(function BooleanField(
  {
    id,
    label,
    checked,
    defaultChecked = false,
    onCheckedChange,
    tone = 'default',
    size,
    disabled,
    invalid,
    describedBy,
    name,
    className,
    toolbarAlign,
    onBlur,
  },
  ref,
) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const formSize = useFieldControlSize()
  const filterChrome = useOptionalFilterChrome()
  const resolved = resolveBooleanFieldScale({
    explicitSize: size,
    filterDensity: filterChrome?.density,
    formSize,
  })
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked)
  const isChecked = checked ?? uncontrolledChecked

  return (
    <label
      data-choice-tone={tone}
      data-checked={isChecked ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : undefined}
      data-invalid={invalid ? 'true' : undefined}
      data-size={resolved.explicit}
      data-field-scale={resolved.scale}
      data-field-align={toolbarAlign ? '' : undefined}
      className={cn(UI_BOOLEAN_FIELD_CLASS, className)}
    >
      <Checkbox
        ref={ref}
        id={controlId}
        name={name}
        tone={tone}
        checked={checked}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onBlur={onBlur}
        onCheckedChange={(next) => {
          const value = next === true
          if (checked === undefined) setUncontrolledChecked(value)
          onCheckedChange?.(value)
        }}
      />
      <span className={cn('ui-boolean-field__label', TEXT_VARIANT_MAP.option)}>{label}</span>
    </label>
  )
})
