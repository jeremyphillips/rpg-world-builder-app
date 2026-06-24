'use client'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { fieldWidthVariants } from './field-control.variants'
import type { FieldSize } from './field.client'
import { Input } from './input.client'
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
  diceFormulaCountInputVariants,
  diceFormulaFacesTriggerVariants,
  diceFormulaModifierInputVariants,
  diceFormulaOperatorTriggerVariants,
  diceFormulaRowVariants,
  diceFormulaSeparatorVariants,
} from './dice-formula-field.variants'

const ADD_MODIFIER_LABEL = 'Add modifier'
const REMOVE_MODIFIER_LABEL = 'Remove modifier'

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
  return (
    <div className={cn('space-y-1', fieldWidthVariants({ width: 'xs' }))}>
      <label htmlFor={id} className="sr-only">
        Count
      </label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        size={size}
        min={countMin}
        max={countMax}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        className={diceFormulaCountInputVariants()}
        value={resolved.count}
        onChange={(event) => {
          onUpdate({ count: parseInputInt(event.target.value, resolved.count, countMin, countMax) })
        }}
        onBlur={onBlur}
      />
    </div>
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
  return (
    <div className={cn('space-y-1', fieldWidthVariants({ width: 'sm' }))}>
      <label htmlFor={id} className="sr-only">
        Die faces
      </label>
      <Select
        value={String(resolved.faces)}
        onValueChange={(next) => onUpdate({ faces: Number(next) })}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          size={size}
          aria-invalid={hasError || undefined}
          className={diceFormulaFacesTriggerVariants()}
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
    </div>
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
      <div className={cn('space-y-1', fieldWidthVariants({ width: 'xs' }))}>
        <label htmlFor={operatorId} className="sr-only">
          Operator
        </label>
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
            aria-invalid={hasError || undefined}
            className={diceFormulaOperatorTriggerVariants()}
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
      </div>

      <div className={cn('space-y-1', fieldWidthVariants({ width: 'xs' }))}>
        <label htmlFor={modifierId} className="sr-only">
          Modifier
        </label>
        <Input
          id={modifierId}
          type="number"
          inputMode="numeric"
          size={size}
          min={modifierMin}
          max={modifierMax}
          disabled={disabled}
          aria-invalid={hasError || undefined}
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
      </div>

      {modifierMode === 'optional' ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-10 shrink-0 px-2 text-xs"
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

      <span aria-hidden className={diceFormulaSeparatorVariants()}>
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
          className="h-10 shrink-0 px-2 text-xs"
          disabled={disabled}
          onClick={() => onUpdate({ modifier: { ...DEFAULT_DICE_FORMULA_MODIFIER } })}
        >
          {ADD_MODIFIER_LABEL}
        </Button>
      ) : null}
    </div>
  )
}
