import type { ReactElement, ReactNode } from 'react'

import { Field } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldRadiogroupLabel } from './field-label-content'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'

import type { FieldChrome } from './field-chrome.variants'
import type { FieldControlBand } from './field-control-band.variants'
import type { FieldValidationProps } from './field-validation-props'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import type { FieldLabelPresentationProps } from './field-label-props'

export interface BaseRadioFieldProps extends FieldValidationProps, FieldLabelPresentationProps {
  id: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: ReactNode
  required?: boolean
  size?: FieldSize
  width?: FieldWidth
  labelVisibility?: FieldLabelVisibility
  chrome?: FieldChrome
  /** Default `single-line`. Card-style groups use `content-sized`. */
  controlBand?: FieldControlBand
}

export interface RadioFieldShellProps extends BaseRadioFieldProps {
  children: (labelId: string) => ReactElement
}

/** Shared `Field.Root` shell for labelled radio groups (`aria-labelledby` pattern). */
export function RadioFieldShell({
  id,
  label,
  error,
  invalid,
  describedBy,
  hint,
  hintPosition,
  info,
  required,
  size,
  width,
  labelVisibility,
  chrome,
  controlBand,
  children,
}: RadioFieldShellProps) {
  const labelId = `${id}-label`

  return (
    <Field.Root
      id={id}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      hint={hint}
      required={required}
      size={size}
      width={width}
    >
      <FieldLayout
        hintPosition={hintPosition}
        label={
          <FieldRadiogroupLabel
            id={labelId}
            label={label}
            required={required}
            info={info}
            size={size}
            labelVisibility={labelVisibility}
          />
        }
        control={children(labelId)}
        chrome={chrome}
        size={size}
        controlBand={controlBand}
      />
    </Field.Root>
  )
}
