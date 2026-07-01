'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import type { FieldSize } from './field.client'
import { fieldDigitsForMax } from './field-digit-metrics'
import { NumberInput } from './number-input.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
import {
  defaultModifierForOperators,
  DICE_FORMULA_OPERATORS,
  parseInputInt,
  type DiceFormulaCurrencyUnitOption,
  type DiceFormulaLabelPosition,
  type DiceFormulaModifierMode,
  type DiceFormulaPatch,
  type DiceFormulaTailOperator,
  type DiceFormulaValue,
} from './dice-formula-field.lib'
import {
  diceFormulaControlCellVariants,
  diceFormulaCoreGroupVariants,
  diceFormulaCountInputVariants,
  diceFormulaGroupedCountRootVariants,
  diceFormulaGroupedFacesSegmentVariants,
  diceFormulaGroupedModifierRootVariants,
  diceFormulaGroupedOperatorSegmentVariants,
  diceFormulaModifierGroupVariants,
  diceFormulaModifierInputVariants,
  diceFormulaSeparatorVariants,
} from './dice-formula-field.variants'
import { InlineSentenceRow } from './inline-sentence-row'
import { inputSelectDividerVariants } from './input-select-field.variants'

const ADD_MODIFIER_LABEL = 'Add modifier'
const REMOVE_MODIFIER_LABEL = 'Remove modifier'

export type { DiceFormulaCurrencyUnitOption }

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
  modifierOperators: readonly DiceFormulaTailOperator[]
  modifierAmountLabel: string
  labelPosition: DiceFormulaLabelPosition
  inlineLabelId: string
  currencyUnit?: {
    value: string
    options: readonly DiceFormulaCurrencyUnitOption[]
    onChange: (value: string) => void
  }
  onBlur?: () => void
  onUpdate: (patch: DiceFormulaPatch) => void
}

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
        grouped
        size={size}
        min={countMin}
        max={countMax}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        digits={digits}
        rootClassName={diceFormulaGroupedCountRootVariants()}
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
          grouped
          size={size}
          digits={digits}
          aria-invalid={hasError || undefined}
          className={diceFormulaGroupedFacesSegmentVariants({ size })}
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

function DiceFormulaCoreControls({
  countId,
  facesId,
  size,
  resolved,
  faces,
  disabled,
  hasError,
  countMin,
  countMax,
  onBlur,
  onUpdate,
}: {
  countId: string
  facesId: string
  size: FieldSize
  resolved: DiceFormulaValue
  faces: readonly number[]
  disabled: boolean
  hasError: boolean
  countMin: number
  countMax: number
  onBlur?: () => void
  onUpdate: (patch: DiceFormulaPatch) => void
}) {
  return (
    <div className={diceFormulaCoreGroupVariants({ invalid: hasError, disabled })}>
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

      <div aria-hidden className={inputSelectDividerVariants()} />

      <span aria-hidden className={diceFormulaSeparatorVariants({ size })}>
        d
      </span>

      <div aria-hidden className={inputSelectDividerVariants()} />

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
  )
}

function DiceFormulaStaticOperator({
  operator,
  size,
}: {
  operator: DiceFormulaTailOperator
  size: FieldSize
}) {
  return (
    <span
      aria-hidden
      className={cn(
        diceFormulaGroupedOperatorSegmentVariants({ size }),
        'flex items-center justify-center tabular-nums',
      )}
    >
      {operator}
    </span>
  )
}

function DiceFormulaModifierControls({
  operatorId,
  modifierId,
  currencyId,
  size,
  resolved,
  disabled,
  hasError,
  modifierMin,
  modifierMax,
  modifierMode,
  modifierOperators,
  modifierAmountLabel,
  currencyUnit,
  onBlur,
  onUpdate,
  onRemoveModifier,
}: {
  operatorId: string
  modifierId: string
  currencyId: string
  size: FieldSize
  resolved: DiceFormulaValue
  disabled: boolean
  hasError: boolean
  modifierMin: number
  modifierMax: number
  modifierMode: DiceFormulaModifierMode
  modifierOperators: readonly DiceFormulaTailOperator[]
  modifierAmountLabel: string
  currencyUnit?: DiceFormulaControlsProps['currencyUnit']
  onBlur?: () => void
  onUpdate: (patch: DiceFormulaPatch) => void
  onRemoveModifier: () => void
}) {
  const singleOperator = modifierOperators.length === 1
  const resolvedOperator = resolved.modifier?.operator ?? modifierOperators[0] ?? '+'

  return (
    <>
      <div className={diceFormulaModifierGroupVariants({ invalid: hasError, disabled })}>
        {singleOperator ? (
          <DiceFormulaStaticOperator operator={resolvedOperator} size={size} />
        ) : (
          <DiceFormulaControlCell id={operatorId} label="Operator">
            <Select
              value={resolvedOperator}
              onValueChange={(next) =>
                onUpdate({
                  modifier: {
                    operator: next as DiceFormulaTailOperator,
                    amount: resolved.modifier?.amount ?? 1,
                  },
                })
              }
              disabled={disabled}
            >
              <SelectTrigger
                id={operatorId}
                grouped
                size={size}
                digits={1}
                aria-invalid={hasError || undefined}
                className={diceFormulaGroupedOperatorSegmentVariants({ size })}
                onBlur={onBlur}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modifierOperators.map((operator) => (
                  <SelectItem key={operator} value={operator}>
                    {operator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DiceFormulaControlCell>
        )}

        {!singleOperator ? <div aria-hidden className={inputSelectDividerVariants()} /> : null}

        <DiceFormulaControlCell id={modifierId} label={modifierAmountLabel}>
          <NumberInput
            id={modifierId}
            grouped
            size={size}
            min={modifierMin}
            max={modifierMax}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            digits={fieldDigitsForMax(modifierMax)}
            rootClassName={diceFormulaGroupedModifierRootVariants()}
            className={diceFormulaModifierInputVariants()}
            value={resolved.modifier?.amount ?? 1}
            onChange={(event) => {
              onUpdate({
                modifier: {
                  operator: resolvedOperator,
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

        {currencyUnit ? (
          <>
            <div aria-hidden className={inputSelectDividerVariants()} />
            <DiceFormulaControlCell id={currencyId} label="Currency">
              <Select
                value={currencyUnit.value}
                onValueChange={currencyUnit.onChange}
                disabled={disabled}
              >
                <SelectTrigger
                  id={currencyId}
                  grouped
                  size={size}
                  digits={2}
                  aria-invalid={hasError || undefined}
                  className={diceFormulaGroupedFacesSegmentVariants({ size })}
                  onBlur={onBlur}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyUnit.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DiceFormulaControlCell>
          </>
        ) : null}
      </div>

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
  modifierOperators = DICE_FORMULA_OPERATORS,
  modifierAmountLabel = 'Modifier',
  labelPosition,
  inlineLabelId,
  currencyUnit,
  onBlur,
  onUpdate,
}: DiceFormulaControlsProps) {
  const countId = `${id}-count`
  const facesId = `${id}-faces`
  const operatorId = `${id}-operator`
  const modifierId = `${id}-modifier`
  const currencyId = `${id}-currency`

  return (
    <InlineSentenceRow
      role={labelPosition === 'inline' ? 'group' : undefined}
      aria-labelledby={labelPosition === 'inline' ? inlineLabelId : undefined}
    >
      <DiceFormulaCoreControls
        countId={countId}
        facesId={facesId}
        size={size}
        resolved={resolved}
        faces={faces}
        disabled={disabled}
        hasError={hasError}
        countMin={countMin}
        countMax={countMax}
        onBlur={onBlur}
        onUpdate={onUpdate}
      />

      {showModifierFields ? (
        <DiceFormulaModifierControls
          operatorId={operatorId}
          modifierId={modifierId}
          currencyId={currencyId}
          size={size}
          resolved={resolved}
          disabled={disabled}
          hasError={hasError}
          modifierMin={modifierMin}
          modifierMax={modifierMax}
          modifierMode={modifierMode}
          modifierOperators={modifierOperators}
          modifierAmountLabel={modifierAmountLabel}
          currencyUnit={currencyUnit}
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
          onClick={() => onUpdate({ modifier: defaultModifierForOperators(modifierOperators) })}
        >
          {ADD_MODIFIER_LABEL}
        </Button>
      ) : null}
    </InlineSentenceRow>
  )
}
