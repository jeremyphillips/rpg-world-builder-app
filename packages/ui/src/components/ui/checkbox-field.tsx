import type { ComponentProps, ReactNode } from 'react'

import { useFieldRowParticipation } from './field-row-anatomy.context'
import { Field, type FieldSize } from './field.client'
import { FieldLabelInfoAction } from './field-label-content'
import { CheckboxFieldOptionLabel } from './checkbox-field-option-label'
import { CheckboxOption, type CheckboxOptionShell } from './checkbox-option.client'
import type { CheckboxOptionScale } from './checkbox-option.lib'
import { fieldLabelHintStackClasses } from './field.variants'
import type { FieldWidth } from './field-control.variants'
import { resolveFieldPresentation } from './field-row-presentation.lib'
import { FieldControlRegion, FieldLabelRegion, FieldMessageRegion } from './field-anatomy-regions'

import { FieldChromeShell } from './field-chrome-shell'
import type { FieldChromeProps } from './field-chrome.variants'
import { resolveFieldAnatomyWidth } from './field-chrome.variants'
import type { FieldValidationProps } from './field-validation-props'
import type { FieldLabelPresentationProps } from './field-label-props'
import type { ChoiceTone } from './choice-control.styles'
import { cn } from '../../lib/utils'

export interface CheckboxFieldProps
  extends
    Omit<ComponentProps<typeof CheckboxOption>, 'id' | 'label' | 'size'>,
    FieldValidationProps,
    FieldChromeProps,
    FieldLabelPresentationProps {
  id: string
  hint?: string
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
  size?: FieldSize
  controlSize?: FieldSize
  shell?: CheckboxOptionShell
  tone?: ChoiceTone
  /** Explicit outlined-shell scale — card density still follows the CSS cascade. */
  optionSize?: CheckboxOptionScale
}

function showHintBelowOption(shell: CheckboxOptionShell | undefined, inAnatomyRow: boolean) {
  return shell !== 'outlined' && !inAnatomyRow
}

/** A single checkbox with an inline option label, bound to the compound `Field`. */
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
  controlSize,
  chrome,
  shell,
  tone,
  optionSize,
  ...checkboxProps
}: CheckboxFieldProps) {
  const inAnatomyRow = useFieldRowParticipation()
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)
  const presentation = resolveFieldPresentation({
    size,
    controlSize,
    labelLayout: 'inline',
    controlBand: inAnatomyRow ? 'single-line' : 'content-sized',
  })
  const hintBelowOption = showHintBelowOption(shell, inAnatomyRow)

  return (
    <Field.Root
      id={id}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      hint={hint}
      hintPosition={inAnatomyRow ? 'below-control' : undefined}
      required={required}
      width={rootWidth}
      size={size}
      controlSize={controlSize}
      anatomy
    >
      <FieldChromeShell chrome={chrome} size={size} className={cn('flex flex-col')}>
        <FieldLabelRegion size={size} />
        <FieldControlRegion>
          <div className={presentation.controlBandClassName}>
            <div className={cn(hintBelowOption && fieldLabelHintStackClasses)}>
              <CheckboxOption
                id={id}
                label={
                  <CheckboxFieldOptionLabel
                    label={label}
                    labelVisibility={labelVisibility}
                    required={required}
                    info={info}
                  />
                }
                shell={shell}
                tone={tone}
                size={optionSize}
                invalid={invalid ?? Boolean(error)}
                describedBy={describedBy}
                required={required}
                {...checkboxProps}
              />
              {labelVisibility === 'srOnly' && info != null ? (
                <FieldLabelInfoAction label={label} info={info} />
              ) : null}
              {hintBelowOption ? <Field.Hint /> : null}
            </div>
          </div>
        </FieldControlRegion>
        <FieldMessageRegion size={size}>
          {inAnatomyRow && <Field.Hint />}
          <Field.Error />
        </FieldMessageRegion>
      </FieldChromeShell>
    </Field.Root>
  )
}
