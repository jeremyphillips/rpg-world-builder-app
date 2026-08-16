'use client'

import type { ReactElement, ReactNode } from 'react'

import type { FieldChrome } from './field-chrome.variants'
import { FieldChromeShell } from './field-chrome-shell'
import { hasActiveFieldChrome } from './field-chrome.variants'
import type { FieldControlBand } from './field-control-band.variants'
import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import { FormFieldLabel } from '../../form/presentation/form-field-label.client'
import {
  mapFormLabelPositionToLayout,
  resolveFieldPresentation,
} from './field-row-presentation.lib'
import {
  fieldLabelHintStackClasses,
  type FieldHintPosition,
  type FieldLabelPosition,
} from './field.variants'
import type { FieldWidth } from './field-control.variants'
import { cn } from '../../lib/utils'

export interface FormFieldProps {
  id: string
  label: string
  error?: string
  invalid?: boolean
  describedBy?: string
  hint?: string
  hintPosition?: FieldHintPosition
  /** Optional info-icon content rendered as an `[i]` tooltip beside the label. */
  info?: ReactNode
  required?: boolean
  size?: FieldSize
  width?: FieldWidth
  /** @default 'visible' */
  labelVisibility?: FieldLabelVisibility
  /** `above` (default) — label over control. `settings` — label + hint left, control right. */
  labelPosition?: FieldLabelPosition
  chrome?: FieldChrome
  /** Default `single-line`. Use `content-sized` for multiline / compound shells. */
  controlBand?: FieldControlBand
  children: ReactElement
}

const labelNode = (
  label: string,
  info?: ReactNode,
  labelVisibility: FieldLabelVisibility = 'visible',
  required?: boolean,
) => {
  if (!label.trim()) return null
  return (
    <FormFieldLabel
      label={label}
      labelVisibility={labelVisibility}
      info={info}
      required={required}
    />
  )
}

/**
 * Prop-based shim over the compound `Field`: label (+ optional `[i]` info
 * tooltip), a single control, and inline hint/error. Use this (or the typed
 * wrappers built on it) for standard fields; reach for `Field.*` directly when
 * a layout needs custom composition.
 */
export function FormField({
  id,
  label,
  error,
  invalid,
  describedBy,
  hint,
  hintPosition,
  info,
  required,
  size = 'md',
  width,
  labelVisibility = 'visible',
  labelPosition = 'above',
  chrome,
  controlBand = 'single-line',
  children,
}: FormFieldProps) {
  if (labelPosition === 'settings') {
    const presentation = resolveFieldPresentation({
      size,
      labelLayout: mapFormLabelPositionToLayout('settings'),
      controlBand,
    })
    const settingsRow = (
      <div data-field-align="" className={cn(presentation.alignmentAnchorClassName)}>
        <div className={presentation.groupClassName}>
          <div className={fieldLabelHintStackClasses}>
            {labelNode(label, info, labelVisibility, required)}
            <Field.Hint />
          </div>
          <div className={presentation.controlBandClassName}>
            <Field.Control>{children}</Field.Control>
          </div>
        </div>
      </div>
    )
    const chromedRow = hasActiveFieldChrome(chrome) ? (
      <FieldChromeShell chrome={chrome} size={size}>
        {settingsRow}
      </FieldChromeShell>
    ) : (
      settingsRow
    )

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
        {chromedRow}
        <Field.Error />
      </Field.Root>
    )
  }

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
        label={labelNode(label, info, labelVisibility, required)}
        control={children}
        chrome={chrome}
        size={size}
        controlBand={controlBand}
      />
    </Field.Root>
  )
}
