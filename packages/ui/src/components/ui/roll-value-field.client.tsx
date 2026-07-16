'use client'

import * as React from 'react'

import { DIE_FACES } from '@rpg/contracts/primitives'

import { cn } from '../../lib/utils'
import { Field, FieldErrorText, FieldHintErrorBelowControl, type FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import { fieldWidthVariants } from './field-control.variants'
import { FieldLabelContent } from './field-label-content'
import { ADD_DICE_LABEL, DiceFormulaControls } from './dice-formula-field-controls.client'
import type { DiceFormulaPatch } from './dice-formula-field.lib'
import { FieldLayout } from './field-layout'
import type { FieldHintPosition } from './field.variants'
import {
  applyRollValueFieldPatch,
  defaultRollValueDice,
  defaultRollValueModifier,
  resolveRollValueFieldDefaults,
  rollValuePartsToDiceFormula,
  ROLL_VALUE_MODIFIER_OPERATORS,
  shouldShowRollValueDiceFields,
  shouldShowRollValueModifierFields,
  type RollFlatOperator,
  type RollValueFieldDefaults,
  type RollValueFieldParts,
} from './roll-value-field.lib'

const ROLL_VALUE_CONTROL_LABELS = {
  count: 'Number of dice',
  faces: 'Die size',
  operator: 'Modifier sign',
  modifierAmount: 'Flat modifier value',
} as const

export interface RollValueFieldProps {
  id: string
  label: string
  parts: RollValueFieldParts
  onPartsChange: (patch: ReturnType<typeof applyRollValueFieldPatch>) => void
  onBlur?: () => void
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  width?: FieldWidth
  faces?: readonly number[]
  countMin?: number
  countMax?: number
  modifierMin?: number
  modifierMax?: number
  defaults?: Partial<RollValueFieldDefaults>
}

/** Contract-shaped roll editor: optional dice core and optional signed flat modifier. */
export function RollValueField({
  id,
  label,
  parts,
  onPartsChange,
  onBlur,
  error,
  hint,
  hintPosition = 'below-label',
  info,
  required = false,
  disabled = false,
  size = 'md',
  width = 'full',
  faces = DIE_FACES,
  countMin = 1,
  countMax = 99,
  modifierMin = 0,
  modifierMax = 99,
  defaults,
}: RollValueFieldProps) {
  const fieldDefaults = React.useMemo(
    () => resolveRollValueFieldDefaults(defaults, faces),
    [defaults, faces],
  )
  const resolved = React.useMemo(
    () => rollValuePartsToDiceFormula(parts, fieldDefaults),
    [fieldDefaults, parts],
  )
  const showDiceFields = shouldShowRollValueDiceFields(parts)
  const showModifierFields = shouldShowRollValueModifierFields(parts)
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const inlineLabelId = `${id}-inline-label`
  const hasError = Boolean(error)
  const describedBy = hasError ? errorId : hint ? hintId : undefined

  const applyPatch = React.useCallback(
    (patch: DiceFormulaPatch) => {
      if (patch.clearModifier) {
        onPartsChange({ clearFlat: true })
        return
      }

      if (patch.modifier !== undefined) {
        onPartsChange({
          flatOperator: patch.modifier.operator as RollFlatOperator,
          flatAmount: patch.modifier.amount,
        })
        return
      }

      onPartsChange(applyRollValueFieldPatch(parts, patch, fieldDefaults))
    },
    [fieldDefaults, onPartsChange, parts],
  )

  const handleAddDice = React.useCallback(() => {
    onPartsChange(defaultRollValueDice(fieldDefaults))
  }, [fieldDefaults, onPartsChange])

  const controls = (
    <DiceFormulaControls
      id={id}
      size={size}
      resolved={resolved}
      faces={faces}
      disabled={disabled}
      hasError={hasError}
      modifierMode="optional"
      showModifierFields={showModifierFields}
      showDiceFields={showDiceFields}
      countMin={countMin}
      countMax={countMax}
      modifierMin={modifierMin}
      modifierMax={modifierMax}
      modifierOperators={ROLL_VALUE_MODIFIER_OPERATORS}
      controlLabels={ROLL_VALUE_CONTROL_LABELS}
      facesNotation
      onAddDice={handleAddDice}
      addDiceLabel={ADD_DICE_LABEL}
      labelPosition="above"
      inlineLabelId={inlineLabelId}
      onBlur={onBlur}
      onUpdate={(patch) => {
        if (
          !showModifierFields &&
          patch.modifier !== undefined &&
          patch.count === undefined &&
          patch.faces === undefined &&
          !patch.clearModifier
        ) {
          onPartsChange(defaultRollValueModifier())
          return
        }

        applyPatch(patch)
      }}
    />
  )

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} size={size} width={width}>
      <FieldLayout
        hintPosition={hintPosition}
        wrapControl={false}
        label={
          <Field.Label
            id={`${id}-label`}
            htmlFor={showDiceFields ? `${id}-count` : `${id}-operator`}
          >
            <FieldLabelContent label={label} info={info} />
          </Field.Label>
        }
        control={
          <div
            role="group"
            aria-labelledby={`${id}-label`}
            aria-describedby={describedBy}
            aria-invalid={hasError || undefined}
            className={cn(fieldWidthVariants({ width }))}
          >
            {controls}
          </div>
        }
      />
      {hintPosition === 'below-label' && error ? (
        <FieldErrorText id={errorId} size={size}>
          {error}
        </FieldErrorText>
      ) : hintPosition !== 'below-label' ? (
        <FieldHintErrorBelowControl
          hint={hint}
          error={error}
          hintId={hintId}
          errorId={errorId}
          size={size}
        />
      ) : null}
    </Field.Root>
  )
}
