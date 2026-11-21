'use client'

import type { ComponentProps, ReactNode } from 'react'

import { Field, useFieldRootContext } from './field.client'
import { FieldLabelLine } from './field-label-content'
import { CheckboxFieldOptionLabel } from './checkbox-field-option-label'
import { Checkbox } from './checkbox.client'
import { CheckboxOption, type CheckboxOptionShell } from './checkbox-option.client'
import type { CheckboxOptionScale } from './checkbox-option.lib'
import { choiceOptionLabelClassName } from './choice-option-typography.lib'
import {
  fieldInlineCheckboxControlColumnClasses,
  fieldInlineToggleRowClasses,
  fieldLabelHintStackClasses,
} from './field.variants'
import type { ChoiceTone } from './choice-control.styles'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'

type OutlinedCheckboxOptionProps = Omit<
  ComponentProps<typeof CheckboxOption>,
  'id' | 'label' | 'describedBy' | 'invalid'
> & {
  id: string
  label: ReactNode
  invalid?: boolean
}

function CheckboxFieldOutlinedOption({
  id,
  label,
  invalid,
  shell,
  tone,
  size,
  required,
  ...checkboxProps
}: OutlinedCheckboxOptionProps) {
  const { describedBy, hasError, controlId } = useFieldRootContext('CheckboxField.OutlinedOption')
  return (
    <CheckboxOption
      id={id ?? controlId}
      label={label}
      shell={shell}
      tone={tone}
      size={size}
      invalid={invalid ?? hasError}
      describedBy={describedBy}
      required={required}
      {...checkboxProps}
    />
  )
}

export type CheckboxFieldInlineToggleProps = Omit<
  ComponentProps<typeof CheckboxOption>,
  'id' | 'label' | 'size' | 'hint'
> & {
  id: string
  optionLabel: ReactNode
  labelNode: ReactNode
  outlined: boolean
  shell?: CheckboxOptionShell
  tone?: ChoiceTone
  optionSize?: CheckboxOptionScale
  invalid?: boolean
  error?: string
  required?: boolean
  showHintInLabelColumn: boolean
  controlBandClassName: string
}

export function CheckboxFieldInlineToggle({
  id,
  outlined,
  shell,
  tone,
  optionSize,
  optionLabel,
  labelNode,
  invalid,
  error,
  required,
  showHintInLabelColumn,
  controlBandClassName,
  ...checkboxProps
}: CheckboxFieldInlineToggleProps) {
  const plainControl = <Checkbox tone={tone} required={required} {...checkboxProps} />

  return (
    <div className={controlBandClassName}>
      <div className={fieldInlineToggleRowClasses}>
        <div className={fieldInlineCheckboxControlColumnClasses}>
          {outlined ? (
            <CheckboxFieldOutlinedOption
              id={id}
              label={optionLabel}
              shell={shell}
              tone={tone}
              size={optionSize}
              invalid={invalid ?? Boolean(error)}
              required={required}
              {...checkboxProps}
            />
          ) : (
            <Field.Control>{plainControl}</Field.Control>
          )}
        </div>
        <div className={fieldLabelHintStackClasses}>
          {outlined ? null : labelNode}
          {showHintInLabelColumn ? <Field.Hint /> : null}
        </div>
      </div>
    </div>
  )
}

export function buildCheckboxFieldLabelNode(input: {
  id: string
  label: string
  labelVisibility: FieldLabelVisibility
  required?: boolean
  info?: ReactNode
  optionLabelClassName: string
}): ReactNode {
  const optionLabel = (
    <CheckboxFieldOptionLabel
      label={input.label}
      labelVisibility={input.labelVisibility}
      required={input.required}
    />
  )
  return (
    <FieldLabelLine label={input.label} info={input.info}>
      <label htmlFor={input.id} className={input.optionLabelClassName}>
        {optionLabel}
      </label>
    </FieldLabelLine>
  )
}
