'use client'

import { forwardRef, useId, type FocusEventHandler, type ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { TEXT_VARIANT_MAP } from './text.variants'
import { useFieldControlSize } from '../../form/context/form-section.context'
import { useOptionalFilterChrome } from '../../filters/filter-chrome.context'
import { Checkbox } from './checkbox.client'
import type { CheckboxOptionScale } from './checkbox-option.lib'
import { resolveCheckboxOptionShellProps } from './checkbox-option-shell-props.lib'
import { useCheckboxOptionChecked } from './checkbox-option-state.client'
import type { ChoiceTone } from './choice-control.styles'

export const UI_CHECKBOX_OPTION_CLASS = 'ui-checkbox-option' as const

export type CheckboxOptionShell = 'outlined'

export type CheckboxOptionProps = {
  id?: string
  label: ReactNode
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  tone?: ChoiceTone
  /** Outlined pill shell. Omitted = plain intrinsic row. */
  shell?: CheckboxOptionShell
  /** Explicit scale for outlined shell. Card density still follows the CSS cascade. */
  size?: CheckboxOptionScale
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  name?: string
  required?: boolean
  className?: string
  /** Marks the option as a filter-toolbar alignment anchor. */
  toolbarAlign?: boolean
  onBlur?: FocusEventHandler<HTMLButtonElement>
}

export const CheckboxOption = forwardRef<HTMLButtonElement, CheckboxOptionProps>(
  function CheckboxOption(
    {
      id,
      label,
      checked,
      defaultChecked = false,
      onCheckedChange,
      tone = 'default',
      shell,
      size,
      disabled,
      invalid,
      describedBy,
      name,
      required,
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
    const { isChecked, handleCheckedChange } = useCheckboxOptionChecked(
      checked,
      defaultChecked,
      onCheckedChange,
    )
    const shellProps = resolveCheckboxOptionShellProps({
      shell,
      size,
      filterDensity: filterChrome?.density,
      formSize,
      toolbarAlign,
      tone,
      isChecked,
      disabled,
      invalid,
    })

    return (
      <label {...shellProps} className={cn(UI_CHECKBOX_OPTION_CLASS, className)}>
        <Checkbox
          ref={ref}
          id={controlId}
          name={name}
          tone={tone}
          focusContext="standalone"
          checked={checked}
          defaultChecked={checked === undefined ? defaultChecked : undefined}
          disabled={disabled}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onBlur={onBlur}
          onCheckedChange={handleCheckedChange}
        />
        <span className={cn('ui-checkbox-option__label', TEXT_VARIANT_MAP.option)}>{label}</span>
      </label>
    )
  },
)
