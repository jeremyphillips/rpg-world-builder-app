'use client'

import * as React from 'react'

import { DIE_FACES } from '@rpg/contracts/primitives'

import { cn } from '../../lib/utils'
import { Field, type FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import { fieldWidthVariants } from './field-control.variants'
import { FieldErrorText, FieldHintBelowLabel, FieldHintErrorBelowControl } from './field-messages'
import { FieldLabelContent } from './field-label-content'
import { DiceFormulaControls } from './dice-formula-field-controls.client'
import {
  applyDiceFormulaPatch,
  DICE_FORMULA_OPERATORS,
  emitDiceFormulaChange,
  type DiceFormulaCurrencyUnitOption,
  type DiceFormulaLabelPosition,
  type DiceFormulaModifierMode,
  type DiceFormulaPatch,
  type DiceFormulaTailOperator,
  type DiceFormulaValue,
  resolveDiceFormulaValue,
  shouldShowModifierFields,
} from './dice-formula-field.lib'
import { FieldLayout } from './field-layout'
import {
  fieldAnatomyStackClasses,
  fieldInlineControlRowClasses,
  fieldLabelHintStackClasses,
  fieldLabelVariants,
  type FieldHintPosition,
} from './field.variants'

export interface DiceFormulaFieldProps {
  id: string
  label: string
  value?: DiceFormulaValue
  onChange?: (value: DiceFormulaValue) => void
  onBlur?: () => void
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  width?: FieldWidth
  labelPosition?: DiceFormulaLabelPosition
  modifierMode?: DiceFormulaModifierMode
  faces?: readonly number[]
  countMin?: number
  countMax?: number
  modifierMin?: number
  modifierMax?: number
  modifierOperators?: readonly DiceFormulaTailOperator[]
  modifierAmountLabel?: string
  currencyUnit?: {
    value: string
    options: readonly DiceFormulaCurrencyUnitOption[]
    onChange: (value: string) => void
  }
}

/** Composite XdY [±N] roll editor with optional or required flat modifiers. */
export function DiceFormulaField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  hintPosition = 'below-label',
  info,
  required = false,
  disabled = false,
  size = 'md',
  width = 'full',
  labelPosition = 'above',
  modifierMode = 'optional',
  faces = DIE_FACES,
  countMin = 1,
  countMax = 99,
  modifierMin = 0,
  modifierMax = 99,
  modifierOperators = DICE_FORMULA_OPERATORS,
  modifierAmountLabel = 'Modifier',
  currencyUnit,
}: DiceFormulaFieldProps) {
  const resolved = resolveDiceFormulaValue(value, modifierMode, faces, modifierOperators)
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const inlineLabelId = `${id}-inline-label`
  const hasError = Boolean(error)
  const describedBy = hasError ? errorId : hint ? hintId : undefined
  const showModifierFields = shouldShowModifierFields(modifierMode, resolved)

  const update = React.useCallback(
    (patch: DiceFormulaPatch) => {
      const next = applyDiceFormulaPatch(resolved, patch, modifierMode, modifierOperators)
      emitDiceFormulaChange(next, modifierMode, onChange)
    },
    [modifierMode, modifierOperators, onChange, resolved],
  )

  const controls = (
    <DiceFormulaControls
      id={id}
      size={size}
      resolved={resolved}
      faces={faces}
      disabled={disabled}
      hasError={hasError}
      modifierMode={modifierMode}
      showModifierFields={showModifierFields}
      countMin={countMin}
      countMax={countMax}
      modifierMin={modifierMin}
      modifierMax={modifierMax}
      modifierOperators={modifierOperators}
      modifierAmountLabel={modifierAmountLabel}
      currencyUnit={currencyUnit}
      labelPosition={labelPosition}
      inlineLabelId={inlineLabelId}
      onBlur={onBlur}
      onUpdate={update}
    />
  )

  if (labelPosition === 'inline') {
    return (
      <div
        id={id}
        aria-describedby={describedBy}
        aria-invalid={hasError || undefined}
        className={cn(fieldAnatomyStackClasses, fieldWidthVariants({ width }))}
        onBlur={onBlur}
      >
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

        {hintPosition === 'below-label' ? (
          error ? (
            <FieldErrorText id={errorId}>{error}</FieldErrorText>
          ) : null
        ) : (
          <FieldHintErrorBelowControl hint={hint} error={error} hintId={hintId} errorId={errorId} />
        )}
      </div>
    )
  }

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} size={size} width={width}>
      <FieldLayout
        hintPosition={hintPosition}
        wrapControl={false}
        label={
          <Field.Label id={`${id}-label`} htmlFor={`${id}-count`}>
            <FieldLabelContent label={label} info={info} />
          </Field.Label>
        }
        control={
          <div
            role="group"
            aria-labelledby={`${id}-label`}
            aria-describedby={describedBy}
            aria-invalid={hasError || undefined}
          >
            {controls}
          </div>
        }
      />
    </Field.Root>
  )
}
