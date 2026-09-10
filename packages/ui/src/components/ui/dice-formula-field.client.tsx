'use client'

import * as React from 'react'

import { DIE_FACES } from '@rpg/contracts/primitives'

import { FieldLayout } from './field-layout'
import { resolveFieldAnatomyWidth, type FieldChrome } from './field-chrome.variants'
import { Field, type FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import { FieldLabelContent } from './field-label-content'
import { DiceFormulaControls } from './dice-formula-field-controls.client'
import { DiceFormulaInlineField } from './dice-formula-field-inline.client'
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
import type { FieldHintPosition } from './field.variants'

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
  chrome?: FieldChrome
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
  chrome,
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
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)

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
      <DiceFormulaInlineField
        id={id}
        label={label}
        error={error}
        hint={hint}
        hintPosition={hintPosition}
        info={info}
        required={required}
        size={size}
        width={rootWidth}
        chrome={chrome}
        inlineLabelId={inlineLabelId}
        hintId={hintId}
        errorId={errorId}
        describedBy={describedBy}
        hasError={hasError}
        controls={controls}
        onBlur={onBlur}
      />
    )
  }

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} size={size} width={rootWidth}>
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
        chrome={chrome}
        size={size}
      />
    </Field.Root>
  )
}
