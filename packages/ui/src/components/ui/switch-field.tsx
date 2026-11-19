import type { ComponentProps, ReactNode } from 'react'

import { useFieldRowParticipation } from './field-row-anatomy.context'
import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { FormField } from './form-field'
import { FormFieldLabel } from '../../form/presentation/form-field-label.client'
import { FieldChromeShell } from './field-chrome-shell'
import type { FieldChromeProps } from './field-chrome.variants'
import { resolveFieldAnatomyWidth } from './field-chrome.variants'
import { Switch } from './switch.client'
import {
  fieldInlineSwitchControlColumnClasses,
  fieldInlineToggleRowClasses,
  fieldLabelHintStackClasses,
  type FieldHintPosition,
  type FieldLabelPosition,
} from './field.variants'
import type { FieldWidth } from './field-control.variants'
import { resolveFieldPresentation } from './field-row-presentation.lib'
import { FieldControlRegion, FieldLabelRegion, FieldMessageRegion } from './field-anatomy-regions'
import type { FieldValidationProps } from './field-validation-props'
import type { FieldLabelPresentationProps } from './field-label-props'
import { cn } from '../../lib/utils'

export type SwitchLabelPosition = FieldLabelPosition | 'inline'

export interface SwitchFieldProps
  extends
    Omit<ComponentProps<typeof Switch>, 'id'>,
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
  /**
   * `inline` (default) — switch left, label right.
   * `above` — label over the switch.
   * `settings` — label + hint left, switch right (dense settings panels).
   */
  labelPosition?: SwitchLabelPosition
}

/** A labelled toggle switch bound to the compound `Field`. */
export function SwitchField({
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
  labelPosition = 'inline',
  chrome,
  ...switchProps
}: SwitchFieldProps) {
  const inAnatomyRow = useFieldRowParticipation()
  const resolvedHintPosition = inAnatomyRow ? 'below-control' : (hintPosition ?? 'below-label')
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)

  const labelNode = (
    <FormFieldLabel
      label={label}
      labelVisibility={labelVisibility}
      required={required}
      info={info}
      placement={labelPosition === 'inline' ? 'inlineSwitch' : undefined}
    />
  )

  if (labelPosition === 'settings') {
    return (
      <FormField
        id={id}
        label={label}
        labelVisibility={labelVisibility}
        error={error}
        invalid={invalid}
        describedBy={describedBy}
        hint={hint}
        hintPosition={hintPosition}
        info={info}
        required={required}
        width={rootWidth}
        size={size}
        controlSize={controlSize}
        labelPosition="settings"
        chrome={chrome}
      >
        <Switch {...switchProps} />
      </FormField>
    )
  }

  if (labelPosition === 'above') {
    return (
      <Field.Root
        id={id}
        error={error}
        invalid={invalid}
        describedBy={describedBy}
        hint={hint}
        required={required}
        width={rootWidth}
        size={size}
        controlSize={controlSize}
        labelVisibility={labelVisibility}
        anatomy
      >
        <FieldLayout
          label={labelNode}
          control={<Switch {...switchProps} />}
          chrome={chrome}
          size={size}
          controlSize={controlSize}
        />
      </Field.Root>
    )
  }

  const presentation = resolveFieldPresentation({
    size,
    controlSize,
    labelLayout: 'inline',
    controlBand: inAnatomyRow ? 'single-line' : 'content-sized',
  })

  const regions = (
    <>
      {/* Inline toggles keep the label beside the control; label region stays empty. */}
      <FieldLabelRegion size={size} />
      <FieldControlRegion>
        <div className={presentation.controlBandClassName}>
          <div className={fieldInlineToggleRowClasses}>
            <div className={fieldInlineSwitchControlColumnClasses}>
              <Field.Control>
                <Switch {...switchProps} />
              </Field.Control>
            </div>
            <div className={fieldLabelHintStackClasses}>
              {labelNode}
              {!inAnatomyRow && <Field.Hint />}
            </div>
          </div>
        </div>
      </FieldControlRegion>
      <FieldMessageRegion size={size}>
        {inAnatomyRow && <Field.Hint />}
        <Field.Error />
      </FieldMessageRegion>
    </>
  )

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
      anatomy
    >
      <FieldChromeShell chrome={chrome} size={size} className={cn('flex flex-col')}>
        {regions}
      </FieldChromeShell>
    </Field.Root>
  )
}
