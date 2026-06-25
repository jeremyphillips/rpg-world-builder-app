'use client'

import * as React from 'react'

import { DIE_FACES } from '@rpg/contracts/primitives'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import { Text } from './text'
import { InfoTooltip } from './tooltip.client'
import { DiceFormulaControls } from './dice-formula-field-controls.client'
import {
  applyDiceFormulaPatch,
  emitDiceFormulaChange,
  type DiceFormulaLabelPosition,
  type DiceFormulaModifierMode,
  type DiceFormulaPatch,
  type DiceFormulaValue,
  resolveDiceFormulaValue,
  shouldShowModifierFields,
} from './dice-formula-field.lib'
import { fieldAnatomyStackClasses, fieldLabelVariants } from './field.variants'

export interface DiceFormulaFieldProps {
  id: string
  label: string
  value?: DiceFormulaValue
  onChange?: (value: DiceFormulaValue) => void
  onBlur?: () => void
  error?: string
  hint?: string
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  labelPosition?: DiceFormulaLabelPosition
  modifierMode?: DiceFormulaModifierMode
  faces?: readonly number[]
  countMin?: number
  countMax?: number
  modifierMin?: number
  modifierMax?: number
}

function DiceFormulaFieldLabelContent({
  label,
  required,
  info,
}: {
  label: string
  required: boolean
  info?: React.ReactNode
}) {
  return (
    <>
      {label}
      {required ? (
        <span aria-hidden className="text-destructive">
          *
        </span>
      ) : null}
      {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
    </>
  )
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
  info,
  required = false,
  disabled = false,
  size = 'sm',
  labelPosition = 'above',
  modifierMode = 'optional',
  faces = DIE_FACES,
  countMin = 1,
  countMax = 99,
  modifierMin = 0,
  modifierMax = 99,
}: DiceFormulaFieldProps) {
  const resolved = resolveDiceFormulaValue(value, modifierMode, faces)
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const inlineLabelId = `${id}-inline-label`
  const hasError = Boolean(error)
  const describedBy = hasError ? errorId : hint ? hintId : undefined
  const showModifierFields = shouldShowModifierFields(modifierMode, resolved)

  const update = React.useCallback(
    (patch: DiceFormulaPatch) => {
      const next = applyDiceFormulaPatch(resolved, patch, modifierMode)
      emitDiceFormulaChange(next, modifierMode, onChange)
    },
    [modifierMode, onChange, resolved],
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
      labelPosition={labelPosition}
      inlineLabelId={inlineLabelId}
      onBlur={onBlur}
      onUpdate={update}
    />
  )

  return (
    <fieldset
      id={id}
      aria-describedby={describedBy}
      aria-invalid={hasError || undefined}
      disabled={disabled}
      className={cn(fieldAnatomyStackClasses, 'w-full')}
      onBlur={onBlur}
    >
      {labelPosition === 'above' ? (
        <legend id={`${id}-legend`} className={fieldLabelVariants({ size })}>
          <DiceFormulaFieldLabelContent label={label} required={required} info={info} />
        </legend>
      ) : (
        <legend className="sr-only">{label}</legend>
      )}

      {labelPosition === 'inline' ? (
        <div className="flex flex-wrap items-center gap-3">
          <span id={inlineLabelId} className={cn(fieldLabelVariants({ size }), 'shrink-0')}>
            <DiceFormulaFieldLabelContent label={label} required={required} info={info} />
          </span>
          {controls}
        </div>
      ) : (
        controls
      )}

      {error ? (
        <Text id={errorId} variant="destructive" role="alert" aria-live="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text id={hintId} variant="caption">
          {hint}
        </Text>
      ) : null}
    </fieldset>
  )
}
