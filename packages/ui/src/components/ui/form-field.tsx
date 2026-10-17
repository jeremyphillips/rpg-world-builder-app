'use client'

import type { ReactElement, ReactNode } from 'react'

import {
  hasActiveFieldChrome,
  resolveFieldAnatomyWidth,
  type FieldChrome,
} from './field-chrome.variants'
import { FieldChromeShell } from './field-chrome-shell'
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
import type { FieldLayoutRecommendation } from './field-recommendation.types'
import { FieldRecommendationFieldContent } from './field-recommendation-field-content.client'
import { resolveFieldLayoutRecommendation } from './field-recommendation.lib'

export interface FormFieldProps {
  id: string
  label: string
  error?: string
  invalid?: boolean
  describedBy?: string
  hint?: string
  hintPosition?: FieldHintPosition
  recommendation?: FieldLayoutRecommendation | null
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
  recommendation,
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
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)
  const resolvedRecommendation = resolveFieldLayoutRecommendation(hintPosition, recommendation)

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
            {resolvedRecommendation ? (
              <FieldRecommendationFieldContent recommendation={resolvedRecommendation} />
            ) : null}
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
        <Field.Error />
      </FieldChromeShell>
    ) : (
      <>
        {settingsRow}
        <Field.Error />
      </>
    )

    return (
      <Field.Root
        id={id}
        error={error}
        invalid={invalid}
        describedBy={describedBy}
        hint={hint}
        hintPosition={hintPosition}
        required={required}
        size={size}
        width={rootWidth}
      >
        {chromedRow}
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
      hintPosition={hintPosition}
      required={required}
      size={size}
      width={rootWidth}
      anatomy
    >
      <FieldLayout
        hintPosition={hintPosition}
        recommendation={recommendation}
        labelVisibility={labelVisibility}
        label={labelNode(label, info, labelVisibility, required)}
        control={children}
        chrome={chrome}
        size={size}
        controlBand={controlBand}
      />
    </Field.Root>
  )
}
