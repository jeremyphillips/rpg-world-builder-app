import type { ReactNode } from 'react'

import { type FieldSize } from './field.client'
import { resolveFieldAnatomyWidth, type FieldChromeProps } from './field-chrome.variants'
import type { FieldWidth } from './field-control.variants'
import { type FieldHintPosition, type FieldLabelPosition } from './field.variants'
import type { FieldDigits } from './field-digit-metrics'
import { type FieldOption, type SelectFieldOptionListItem } from '../../form/field-config'
import {
  resolveFieldPlaceholder,
  type FieldPlaceholderPresentation,
} from '../../form/config/field-placeholder.lib'
import type { FieldNoun } from '@rpg/contracts'
import type { FieldValidationProps } from './field-validation-props'
import {
  SelectFieldDefaultLayout,
  SelectFieldInlineLayout,
  SelectFieldSettingsLayout,
  type SelectFieldLayoutSharedProps,
} from './select-field-layout.client'
import { SelectRootWithClear } from './select-field-root-with-clear.client'

export type SelectFieldOption = FieldOption

export type SelectLabelPosition = FieldLabelPosition | 'inline'

export interface SelectFieldProps extends FieldValidationProps, FieldChromeProps {
  id: string
  label: string
  options: SelectFieldOptionListItem[]
  hint?: string
  hintPosition?: FieldHintPosition
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
  size?: FieldSize
  digits?: FieldDigits
  sizingLabel?: string
  sizingLabels?: readonly string[]
  labelPosition?: SelectLabelPosition
  placeholder?: string
  noun?: FieldNoun
  presentation?: FieldPlaceholderPresentation
  name?: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onBlur?: () => void
  clearable?: boolean
  clearAccessibleName?: string
  onClear?: () => void
}

function buildSelectFieldControl(props: SelectFieldProps, resolvedPlaceholder: string | undefined) {
  const resolvedValue =
    typeof props.value === 'string' && props.value.length > 0 ? props.value : undefined
  const size = props.size ?? 'md'

  return (
    <SelectRootWithClear
      label={props.label}
      size={size}
      resolvedValue={resolvedValue}
      defaultValue={props.defaultValue}
      name={props.name}
      disabled={props.disabled}
      clearable={props.clearable ?? false}
      clearAccessibleName={props.clearAccessibleName}
      onClear={props.onClear}
      onValueChange={props.onValueChange}
      triggerConfig={{
        id: props.labelPosition === 'settings' ? props.id : undefined,
        size,
        digits: props.digits,
        sizingLabel: props.sizingLabel,
        sizingLabels: props.sizingLabels,
        onBlur: props.onBlur,
        placeholder: resolvedPlaceholder,
        wrapControl: props.labelPosition !== 'settings',
        grouped: false,
      }}
      options={props.options}
    />
  )
}

/** Labelled Radix Select bound to the compound `Field`. */
export function SelectField(props: SelectFieldProps) {
  const {
    label,
    width,
    size = 'md',
    labelPosition,
    placeholder,
    noun,
    presentation,
    digits,
    chrome,
  } = props

  const resolvedPlaceholder = resolveFieldPlaceholder(
    { label, category: 'choice', noun, digits, presentation },
    placeholder,
  )
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)
  const control = buildSelectFieldControl(props, resolvedPlaceholder)

  const layoutProps: SelectFieldLayoutSharedProps = {
    id: props.id,
    label: props.label,
    error: props.error,
    invalid: props.invalid,
    describedBy: props.describedBy,
    hint: props.hint,
    hintPosition: props.hintPosition,
    info: props.info,
    required: props.required,
    width: rootWidth,
    size,
    chrome,
    control,
  }

  if (labelPosition === 'settings') {
    return <SelectFieldSettingsLayout {...layoutProps} />
  }

  if (labelPosition === 'inline') {
    return <SelectFieldInlineLayout {...layoutProps} />
  }

  return <SelectFieldDefaultLayout {...layoutProps} />
}
