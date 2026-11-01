'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { FieldChromeShell } from './field-chrome-shell'
import { hasActiveFieldChrome, type FieldChrome } from './field-chrome.variants'
import { FieldErrorText, FieldHintBelowLabel, FieldHintText, type FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import { fieldWidthVariants } from './field-control.variants'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import { showOwnedLabelSlot } from './owned-label-visibility.lib'
import { FieldLabelContent, FieldLabelInfoAction } from './field-label-content'
import { shouldShowVisibleRequiredMarker } from './field-required.lib'
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
  labelVisibility?: FieldLabelVisibility
  inlineLabelId: string
  hintId: string
  errorId: string
  describedBy?: string
  hasError: boolean
  controls: ReactNode
  onBlur?: () => void
}

function DiceFormulaInlineLabel({
  label,
  labelVisibility,
  required,
  info,
  size,
  inlineLabelId,
}: Pick<
  DiceFormulaInlineFieldProps,
  'label' | 'labelVisibility' | 'required' | 'info' | 'size' | 'inlineLabelId'
>) {
  const labelSrOnly = labelVisibility === 'srOnly'
  return (
    <>
      <span
        id={inlineLabelId}
        className={cn(fieldLabelVariants({ size }), labelSrOnly ? 'sr-only' : 'shrink-0')}
      >
        <FieldLabelContent
          label={label}
          required={required}
          showRequiredMarker={shouldShowVisibleRequiredMarker(required, labelVisibility)}
          info={labelSrOnly ? undefined : info}
        />
      </span>
      {labelSrOnly && info != null ? <FieldLabelInfoAction label={label} info={info} /> : null}
    </>
  )
}

function DiceFormulaInlineBody({
  label,
  labelVisibility,
  hint,
  hintPosition,
  info,
  required,
  size,
  inlineLabelId,
  hintId,
  error,
  controls,
}: Pick<
  DiceFormulaInlineFieldProps,
  | 'label'
  | 'labelVisibility'
  | 'hint'
  | 'hintPosition'
  | 'info'
  | 'required'
  | 'size'
  | 'inlineLabelId'
  | 'hintId'
  | 'error'
  | 'controls'
>) {
  const hintInLabelSlot = hintPosition === 'below-label' && Boolean(hint)
  const showLabelSlot = showOwnedLabelSlot({
    labelVisibility,
    hintInLabelSlot,
    hasInfo: info != null,
  })
  const ownedLabel = (
    <DiceFormulaInlineLabel
      label={label}
      labelVisibility={labelVisibility}
      required={required}
      info={info}
      size={size}
      inlineLabelId={inlineLabelId}
    />
  )

  return (
    <>
      {showLabelSlot ? (
        <div className={fieldInlineControlRowClasses}>
          {hintInLabelSlot ? (
            <div className={fieldLabelHintStackClasses}>
              {ownedLabel}
              <FieldHintBelowLabel hint={hint} hintId={hintId} />
            </div>
          ) : (
            ownedLabel
          )}
          {controls}
        </div>
      ) : (
        <>
          {ownedLabel}
          <div className={fieldInlineControlRowClasses}>{controls}</div>
        </>
      )}
      {hintPosition === 'below-control' && hint && !error ? (
        <FieldHintText id={hintId}>{hint}</FieldHintText>
      ) : null}
    </>
  )
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
  labelVisibility = 'visible',
  inlineLabelId,
  hintId,
  errorId,
  describedBy,
  hasError,
  controls,
  onBlur,
}: DiceFormulaInlineFieldProps) {
  const inlineBody = (
    <DiceFormulaInlineBody
      label={label}
      labelVisibility={labelVisibility}
      hint={hint}
      hintPosition={hintPosition}
      info={info}
      required={required}
      size={size}
      inlineLabelId={inlineLabelId}
      hintId={hintId}
      error={error}
      controls={controls}
    />
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
