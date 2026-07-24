import type { ComponentProps, ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import { FieldLabelContent } from './field-label-content'
import { Checkbox } from './checkbox.client'
import {
  fieldInlineCheckboxControlColumnClasses,
  fieldInlineToggleRowClasses,
  fieldLabelHintStackClasses,
} from './field.variants'
import type { FieldWidth } from './field-control.variants'
import { resolveFieldPresentation } from './field-row-presentation.lib'

import { FieldChromeShell } from './field-chrome-shell'
import type { FieldChromeProps } from './field-chrome.variants'
import type { FieldValidationProps } from './field-validation-props'

export interface CheckboxFieldProps
  extends Omit<ComponentProps<typeof Checkbox>, 'id'>, FieldValidationProps, FieldChromeProps {
  id: string
  label: string
  hint?: string
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
  size?: FieldSize
}

/** A single checkbox with an inline label, bound to the compound `Field`. */
export function CheckboxField({
  id,
  label,
  error,
  invalid,
  describedBy,
  hint,
  info,
  required,
  width,
  size = 'md',
  chrome,
  ...checkboxProps
}: CheckboxFieldProps) {
  const presentation = resolveFieldPresentation({
    size,
    labelLayout: 'inline',
    // Hint-bearing toggles keep first-line alignment — not a fixed single-line band.
    controlBand: 'content-sized',
  })

  const labelNode = (
    <Field.Label placement="inlineCheckbox">
      <FieldLabelContent label={label} info={info} />
    </Field.Label>
  )

  return (
    <Field.Root
      id={id}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      hint={hint}
      required={required}
      width={width}
      size={size}
    >
      <FieldChromeShell chrome={chrome} size={size}>
        <div data-field-align="" className={presentation.alignmentAnchorClassName}>
          <div className={presentation.controlBandClassName}>
            <div className={fieldInlineToggleRowClasses}>
              <div className={fieldInlineCheckboxControlColumnClasses}>
                <Field.Control>
                  <Checkbox {...checkboxProps} />
                </Field.Control>
              </div>
              <div className={fieldLabelHintStackClasses}>
                {labelNode}
                <Field.Hint />
              </div>
            </div>
          </div>
        </div>
      </FieldChromeShell>
      <Field.Error />
    </Field.Root>
  )
}
