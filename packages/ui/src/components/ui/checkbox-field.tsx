'use client'

import type { ComponentProps, ReactNode } from 'react'

import { useFieldRowParticipation } from './field-row-anatomy.context'
import { Field, type FieldSize } from './field.client'
import { type CheckboxOption } from './checkbox-option.client'
import type { CheckboxOptionShell } from './checkbox-option.client'
import { fieldSizeToOptionTypographyScale, type CheckboxOptionScale } from './checkbox-option.lib'
import { choiceOptionLabelClassName } from './choice-option-typography.lib'
import { type FieldHintPosition } from './field.variants'
import type { FieldWidth } from './field-control.variants'
import { resolveFieldPresentation } from './field-row-presentation.lib'
import { FieldControlRegion, FieldLabelRegion, FieldMessageRegion } from './field-anatomy-regions'
import { CheckboxFieldOptionLabel } from './checkbox-field-option-label'
import {
  buildCheckboxFieldLabelNode,
  CheckboxFieldInlineToggle,
} from './checkbox-field-inline.client'

import { FieldChromeShell } from './field-chrome-shell'
import type { FieldChromeProps } from './field-chrome.variants'
import { resolveFieldAnatomyWidth } from './field-chrome.variants'
import type { FieldValidationProps } from './field-validation-props'
import type { FieldLabelPresentationProps } from './field-label-props'
import type { ChoiceTone } from './choice-control.styles'
import { cn } from '../../lib/utils'

export interface CheckboxFieldProps
  extends
    Omit<ComponentProps<typeof CheckboxOption>, 'id' | 'label' | 'size' | 'hint'>,
    FieldValidationProps,
    FieldChromeProps,
    FieldLabelPresentationProps {
  id: string
  hint?: string
  hintPosition?: FieldHintPosition
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

/** A single checkbox with an inline option label, bound to the compound `Field`. */
export function CheckboxField({
  id,
  label,
  labelVisibility = 'visible',
  error,
  invalid,
  describedBy,
  hint,
  hintPosition,
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
  const resolvedHintPosition = inAnatomyRow ? 'below-control' : (hintPosition ?? 'below-label')
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)
  const presentation = resolveFieldPresentation({
    size,
    controlSize,
    labelLayout: 'inline',
    controlBand: inAnatomyRow ? 'single-line' : 'content-sized',
  })
  const outlined = shell === 'outlined'
  const showHintInLabelColumn = !inAnatomyRow && resolvedHintPosition === 'below-label'
  const showHintInMessageRegion = inAnatomyRow || resolvedHintPosition === 'below-control'

  const optionScale = optionSize ?? fieldSizeToOptionTypographyScale(controlSize ?? size)
  const optionLabelClassName = choiceOptionLabelClassName(optionScale, 'ui-checkbox-option__label')
  const optionLabel = (
    <CheckboxFieldOptionLabel label={label} labelVisibility={labelVisibility} required={required} />
  )
  const labelNode = buildCheckboxFieldLabelNode({
    id,
    label,
    labelVisibility,
    required,
    info,
    optionLabelClassName,
  })

  return (
    <Field.Root
      id={id}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      hint={hint}
      hintPosition={resolvedHintPosition}
      required={required}
      width={rootWidth}
      size={size}
      controlSize={controlSize}
      labelVisibility={labelVisibility}
      anatomy
    >
      <FieldChromeShell chrome={chrome} size={size} className={cn('flex flex-col')}>
        <FieldLabelRegion size={size} />
        <FieldControlRegion>
          <CheckboxFieldInlineToggle
            id={id}
            optionLabel={optionLabel}
            labelNode={labelNode}
            outlined={outlined}
            shell={shell}
            tone={tone}
            optionSize={optionSize}
            invalid={invalid}
            error={error}
            required={required}
            showHintInLabelColumn={showHintInLabelColumn}
            controlBandClassName={presentation.controlBandClassName}
            {...checkboxProps}
          />
        </FieldControlRegion>
        <FieldMessageRegion size={size}>
          {showHintInMessageRegion ? <Field.Hint /> : null}
          <Field.Error />
        </FieldMessageRegion>
      </FieldChromeShell>
    </Field.Root>
  )
}
