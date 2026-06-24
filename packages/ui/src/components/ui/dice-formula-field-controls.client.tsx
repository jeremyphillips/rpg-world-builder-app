'use client'

import type { ReactNode } from 'react'

import { Button } from './button.client'
import type { FieldSize } from './field.client'
import { fieldDigitsForMax } from './field-digit-metrics'
import { NumberInput } from './number-input.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
import {
  DEFAULT_DICE_FORMULA_MODIFIER,
  DICE_FORMULA_OPERATORS,
  parseInputInt,
  type DiceFormulaLabelPosition,
  type DiceFormulaModifierMode,
  type DiceFormulaOperator,
  type DiceFormulaPatch,
  type DiceFormulaValue,
} from './dice-formula-field.lib'
import {
  diceFormulaControlCellVariants,
  diceFormulaCoreVariants,
  diceFormulaCountInputVariants,
  diceFormulaModifierInputVariants,
  diceFormulaRowVariants,
  diceFormulaSelectTriggerVariants,
  diceFormulaSeparatorVariants,
} from './dice-formula-field.variants'

const ADD_MODIFIER_LABEL = 'Add modifier'
const REMOVE_MODIFIER_LABEL = 'Remove modifier'

function DiceFormulaControlCell({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <div className={diceFormulaControlCellVariants()}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {children}
    </div>
  )
}

interface DiceFormulaControlsProps {
  id: string
  size: FieldSize
  resolved: DiceFormulaValue
  faces: readonly number[]
  disabled: boolean
  hasError: boolean
  modifierMode: DiceFormulaModifierMode
  showModifierFields: boolean
  countMin: number
  countMax: number
  modifierMin: number
  modifierMax: number
  labelPosition: DiceFormulaLabelPosition
  inlineLabelId: string
  onBlur?: () => void
  onUpdate: (patch: DiceFormulaPatch) => void
}

function DiceFormulaCountControl({
  id,
  size,
  resolved,
  countMin,
  countMax,
  disabled,
  hasError,
  onBlur,
  onUpdate,
}: Pick<
  DiceFormulaControlsProps,
  | 'id'
  | 'size'
  | 'resolved'
  | 'countMin'
  | 'countMax'
  | 'disabled'
  | 'hasError'
  | 'onBlur'
  | 'onUpdate'
>) {
  const digits = fieldDigitsForMax(countMax)

  return (
    <DiceFormulaControlCell id={id} label="Count">
      <NumberInput
        id={id}
        size={size}
        min={countMin}
        max={countMax}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        digits={digits}
        className={diceFormulaCountInputVariants()}
        value={resolved.count}
        onChange={(event) => {
          onUpdate({ count: parseInputInt(event.target.value, resolved.count, countMin, countMax) })
        }}
        onBlur={onBlur}
      />
    </DiceFormulaControlCell>
  )
}

function DiceFormulaFacesControl({
  id,
  size,
  resolved,
  faces,
  disabled,
  hasError,
  onBlur,
  onUpdate,
}: Pick<
  DiceFormulaControlsProps,
  'id' | 'size' | 'resolved' | 'faces' | 'disabled' | 'hasError' | 'onBlur' | 'onUpdate'
>) {
  const maxFace = faces.reduce((max, face) => Math.max(max, face), 0)
  const digits = fieldDigitsForMax(maxFace)

  return (
    <DiceFormulaControlCell id={id} label="Die faces">
      <Select
        value={String(resolved.faces)}
        onValueChange={(next) => onUpdate({ faces: Number(next) })}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          size={size}
          digits={digits}
          aria-invalid={hasError || undefined}
          className={diceFormulaSelectTriggerVariants()}
          onBlur={onBlur}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {faces.map((face) => (
            <SelectItem key={face} value={String(face)}>
              {face}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </DiceFormulaControlCell>
  )
}

function DiceFormulaModifierControls({
  operatorId,
  modifierId,
  size,
  resolved,
  disabled,
  hasError,
  modifierMin,
  modifierMax,
  modifierMode,
  onBlur,
  onUpdate,
  onRemoveModifier,
}: {
  operatorId: string
  modifierId: string
  size: FieldSize
  resolved: DiceFormulaValue
  disabled: boolean
  hasError: boolean
  modifierMin: number
  modifierMax: number
  modifierMode: DiceFormulaModifierMode
  onBlur?: () => void
  onUpdate: (patch: DiceFormulaPatch) => void
  onRemoveModifier: () => void
}) {
  return (
    <>
      <DiceFormulaControlCell id={operatorId} label="Operator">
        <Select
          value={resolved.modifier?.operator ?? '+'}
          onValueChange={(next) =>
            onUpdate({
              modifier: {
                operator: next as DiceFormulaOperator,
                amount: resolved.modifier?.amount ?? 1,
              },
            })
          }
          disabled={disabled}
        >
          <SelectTrigger
            id={operatorId}
            size={size}
            digits={1}
            aria-invalid={hasError || undefined}
            className={diceFormulaSelectTriggerVariants()}
            onBlur={onBlur}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DICE_FORMULA_OPERATORS.map((operator) => (
              <SelectItem key={operator} value={operator}>
                {operator}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DiceFormulaControlCell>

      <DiceFormulaControlCell id={modifierId} label="Modifier">
        <NumberInput
          id={modifierId}
          size={size}
          min={modifierMin}
          max={modifierMax}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          digits={fieldDigitsForMax(modifierMax)}
          className={diceFormulaModifierInputVariants()}
          value={resolved.modifier?.amount ?? 1}
          onChange={(event) => {
            onUpdate({
              modifier: {
                operator: resolved.modifier?.operator ?? '+',
                amount: parseInputInt(
                  event.target.value,
                  resolved.modifier?.amount ?? 1,
                  modifierMin,
                  modifierMax,
                ),
              },
            })
          }}
          onBlur={onBlur}
        />
      </DiceFormulaControlCell>

      {modifierMode === 'optional' ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 px-2"
          disabled={disabled}
          onClick={onRemoveModifier}
        >
          {REMOVE_MODIFIER_LABEL}
        </Button>
      ) : null}
    </>
  )
}

export function DiceFormulaControls({
  id,
  size,
  resolved,
  faces,
  disabled,
  hasError,
  modifierMode,
  showModifierFields,
  countMin,
  countMax,
  modifierMin,
  modifierMax,
  labelPosition,
  inlineLabelId,
  onBlur,
  onUpdate,
}: DiceFormulaControlsProps) {
  const countId = `${id}-count`
  const facesId = `${id}-faces`
  const operatorId = `${id}-operator`
  const modifierId = `${id}-modifier`

  return (
    <div
      className={diceFormulaRowVariants()}
      role="group"
      aria-labelledby={labelPosition === 'inline' ? inlineLabelId : undefined}
    >
      <div className={diceFormulaCoreVariants()}>
        <DiceFormulaCountControl
          id={countId}
          size={size}
          resolved={resolved}
          countMin={countMin}
          countMax={countMax}
          disabled={disabled}
          hasError={hasError}
          onBlur={onBlur}
          onUpdate={onUpdate}
        />

        <span aria-hidden className={diceFormulaSeparatorVariants({ size })}>
          d
        </span>

        <DiceFormulaFacesControl
          id={facesId}
          size={size}
          resolved={resolved}
          faces={faces}
          disabled={disabled}
          hasError={hasError}
          onBlur={onBlur}
          onUpdate={onUpdate}
        />
      </div>

      {showModifierFields ? (
        <DiceFormulaModifierControls
          operatorId={operatorId}
          modifierId={modifierId}
          size={size}
          resolved={resolved}
          disabled={disabled}
          hasError={hasError}
          modifierMin={modifierMin}
          modifierMax={modifierMax}
          modifierMode={modifierMode}
          onBlur={onBlur}
          onUpdate={onUpdate}
          onRemoveModifier={() => onUpdate({ clearModifier: true })}
        />
      ) : modifierMode === 'optional' ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 px-2"
          disabled={disabled}
          onClick={() => onUpdate({ modifier: { ...DEFAULT_DICE_FORMULA_MODIFIER } })}
        >
          {ADD_MODIFIER_LABEL}
        </Button>
      ) : null}
    </div>
  )
}
