'use client'

import { forwardRef, useId, type FocusEventHandler, type ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { FieldHintText } from './field.client'
import { choiceOptionLabelClassName } from './choice-option-typography.lib'
import { fieldLabelHintStackClasses } from './field.variants'
import { Checkbox } from './checkbox.client'
import type { CheckboxOptionScale } from './checkbox-option.lib'
import { useCheckboxOptionPresentation } from './checkbox-option-presentation.client'
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
  /** Helper copy below the option row; wires `aria-describedby` on the checkbox. */
  hint?: string
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
      hint,
    },
    ref,
  ) {
    const generatedId = useId()
    const hintId = useId()
    const controlId = id ?? generatedId
    const { isChecked, handleCheckedChange } = useCheckboxOptionChecked(
      checked,
      defaultChecked,
      onCheckedChange,
    )
    const { controlSize, resolvedScale, shellProps } = useCheckboxOptionPresentation({
      shell,
      size,
      toolbarAlign,
      tone,
      isChecked,
      disabled,
      invalid,
    })

    const resolvedDescribedBy =
      [describedBy, hint ? hintId : undefined].filter(Boolean).join(' ') || undefined

    const optionRow = (
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
          aria-describedby={resolvedDescribedBy}
          onBlur={onBlur}
          onCheckedChange={handleCheckedChange}
        />
        <span className={choiceOptionLabelClassName(resolvedScale, 'ui-checkbox-option__label')}>
          {label}
        </span>
      </label>
    )

    if (!hint) return optionRow

    return (
      <div className={fieldLabelHintStackClasses}>
        {optionRow}
        <FieldHintText id={hintId} size={controlSize} className="min-w-0 max-w-full break-words">
          {hint}
        </FieldHintText>
      </div>
    )
  },
)
