'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { FieldChromeShell } from './field-chrome-shell'
import { hasActiveFieldChrome, type FieldChrome } from './field-chrome.variants'
import { FieldErrorText, FieldHintBelowLabel, FieldHintText, type FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import { fieldWidthVariants } from './field-control.variants'
import { FieldLabelContent } from './field-label-content'
import {
  fieldAnatomyStackVariants,
  fieldInlineControlRowClasses,
  fieldLabelHintStackClasses,
  fieldLabelVariants,
  type FieldHintPosition,
} from './field.variants'

export interface DiceFormulaInlineFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  size?: FieldSize
  width?: FieldWidth
  chrome?: FieldChrome
  inlineLabelId: string
  hintId: string
  errorId: string
  describedBy?: string
  hasError: boolean
  controls: ReactNode
  onBlur?: () => void
}

/** Inline label + dice controls row for {@link DiceFormulaField}. */
export function DiceFormulaInlineField({
  id,
  label,
  error,
  hint,
  hintPosition = 'below-label',
  info,
  required = false,
  size = 'md',
  width = 'full',
  chrome,
  inlineLabelId,
  hintId,
  errorId,
  describedBy,
  hasError,
  controls,
  onBlur,
}: DiceFormulaInlineFieldProps) {
  const inlineBody = (
    <>
      <div className={fieldInlineControlRowClasses}>
        {hintPosition === 'below-label' ? (
          <div className={fieldLabelHintStackClasses}>
            <span id={inlineLabelId} className={cn(fieldLabelVariants({ size }), 'shrink-0')}>
              <FieldLabelContent label={label} required={required} info={info} />
            </span>
            <FieldHintBelowLabel hint={hint} error={error} hintId={hintId} />
          </div>
        ) : (
          <span id={inlineLabelId} className={cn(fieldLabelVariants({ size }), 'shrink-0')}>
            <FieldLabelContent label={label} required={required} info={info} />
          </span>
        )}
        {controls}
      </div>
      {hintPosition === 'below-control' && hint && !error ? (
        <FieldHintText id={hintId}>{hint}</FieldHintText>
      ) : null}
    </>
  )

  return (
    <div
      id={id}
      aria-describedby={describedBy}
      aria-invalid={hasError || undefined}
      className={cn(fieldAnatomyStackVariants({ size }), fieldWidthVariants({ width }))}
      onBlur={onBlur}
    >
      {hasActiveFieldChrome(chrome) ? (
        <FieldChromeShell chrome={chrome} size={size}>
          {inlineBody}
        </FieldChromeShell>
      ) : (
        inlineBody
      )}
      {error ? (
        <FieldErrorText id={errorId} size={size}>
          {error}
        </FieldErrorText>
      ) : null}
    </div>
  )
}
