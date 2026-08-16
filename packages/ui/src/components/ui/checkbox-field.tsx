import type { ComponentProps, ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import { FieldLabelContent } from './field-label-content'
import { shouldShowVisibleRequiredMarker } from './field-required.lib'
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
import type { FieldLabelPresentationProps } from './field-label-props'
import { cn } from '../../lib/utils'

export interface CheckboxFieldProps
  extends
    Omit<ComponentProps<typeof Checkbox>, 'id'>,
    FieldValidationProps,
    FieldChromeProps,
    FieldLabelPresentationProps {
  id: string
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
  labelVisibility = 'visible',
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
    <Field.Label
      placement="inlineCheckbox"
      className={cn(labelVisibility === 'srOnly' && 'sr-only')}
    >
      <FieldLabelContent
        label={label}
        required={required}
        showRequiredMarker={shouldShowVisibleRequiredMarker(required, labelVisibility)}
        info={info}
      />
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
