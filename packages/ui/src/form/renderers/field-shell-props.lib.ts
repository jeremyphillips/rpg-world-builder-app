import type { ReactNode } from 'react'

import type { FieldSize } from '../../components/ui/field.client'
import {
  pickFieldChromeProps,
  type FieldChrome,
  type FieldChromeProps,
} from '../../components/ui/field-chrome.variants'
import type { FieldWidth } from '../../components/ui/field-control.variants'
import type { FieldHintPosition } from '../../components/ui/field.variants'
import type { FieldLabelPresentationProps } from '../../components/ui/field-label-props'
import type { FieldValidationProps } from '../../components/ui/field-validation-props'
import { resolveFieldLabelVisibility, type FieldLabelVisibility } from '../form-heading.lib'

export type FieldShellSource = {
  config: {
    label: string
    labelVisibility?: FieldLabelVisibility
    info?: ReactNode
    required?: boolean
    width?: FieldWidth
    disabled?: boolean
    chrome?: FieldChrome
  }
  id: string
  hint?: string
  hintPosition?: FieldHintPosition
  presentationSize: FieldSize
  controlSize: FieldSize
}

export type FieldShellOptions = {
  /** `both` passes presentation and control sizes. `presentation` passes `size` only. `none` omits both. */
  sizes: 'both' | 'presentation' | 'none'
  label: 'visible'
}

export type FieldShellProps = FieldLabelPresentationProps &
  FieldValidationProps &
  FieldChromeProps & {
    id: string
    /** Set for controls that take `aria-label` when the visible label is empty. */
    'aria-label'?: string
    /** Set for controls that take `ariaLabel` when the visible label is empty. */
    ariaLabel?: string
    hint?: string
    hintPosition?: FieldHintPosition
    info?: ReactNode
    required?: boolean
    width?: FieldWidth
    disabled?: boolean
    size?: FieldSize
    controlSize?: FieldSize
  }

/** Shared leaf chrome. Callers add control-specific props beside this object. */
export function buildFieldShellProps(
  source: FieldShellSource,
  validation: FieldValidationProps,
  options: FieldShellOptions,
): FieldShellProps {
  const { config } = source
  const label = {
    label: config.label,
    labelVisibility: resolveFieldLabelVisibility(config),
  }
  const sizes =
    options.sizes === 'both'
      ? { size: source.presentationSize, controlSize: source.controlSize }
      : options.sizes === 'presentation'
        ? { size: source.presentationSize }
        : {}

  return {
    id: source.id,
    ...label,
    hint: source.hint,
    hintPosition: source.hintPosition,
    info: config.info,
    required: config.required,
    width: config.width,
    disabled: config.disabled,
    ...pickFieldChromeProps(config),
    ...sizes,
    ...validation,
  }
}
