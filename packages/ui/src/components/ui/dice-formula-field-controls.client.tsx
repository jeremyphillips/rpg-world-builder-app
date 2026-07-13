'use client'

import type { ComponentProps, ReactNode } from 'react'

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
import { InlineSentenceConnector, InlineSentenceRow } from './inline-sentence-row'
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
} from './dice-formula-field.variants'
import { inputSelectDividerVariants } from './input-select-field.variants'

export const ADD_MODIFIER_LABEL = 'Add modifier'
export const REMOVE_MODIFIER_LABEL = 'Remove modifier'
export const ADD_DICE_LABEL = 'Add dice'

export type DiceFormulaControlLabels = {
  count?: string
  faces?: string
  operator?: string
  modifierAmount?: string
}

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
  modifierAmountLabel?: string
  controlLabels?: DiceFormulaControlLabels
  facesNotation?: boolean
  showDiceFields?: boolean
  onAddDice?: () => void
  addDiceLabel?: string
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

function formatDieFaceLabel(face: number, facesNotation: boolean): string {
  return facesNotation ? `d${face}` : String(face)
}

function DiceFormulaCountControl({
  id,
  size,
  resolved,
  countMin,
  countMax,
  disabled,
  hasError,
  countLabel = 'Count',
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
> & {
  countLabel?: string
}) {
  const digits = fieldDigitsForMax(countMax)

  return (
    <DiceFormulaControlCell id={id} label={countLabel}>
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
  facesLabel = 'Die faces',
  facesNotation = false,
  onBlur,
  onUpdate,
}: Pick<
  DiceFormulaControlsProps,
  'id' | 'size' | 'resolved' | 'faces' | 'disabled' | 'hasError' | 'onBlur' | 'onUpdate'
> & {
  facesLabel?: string
  facesNotation?: boolean
}) {
  const maxFace = faces.reduce((max, face) => Math.max(max, face), 0)
  const digits = fieldDigitsForMax(maxFace)

  return (
    <DiceFormulaControlCell id={id} label={facesLabel}>
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
          <SelectValue>{formatDieFaceLabel(resolved.faces, facesNotation)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {faces.map((face) => (
            <SelectItem key={face} value={String(face)}>
              {formatDieFaceLabel(face, facesNotation)}
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
  countLabel,
  facesLabel,
  facesNotation,
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
  countLabel?: string
  facesLabel?: string
  facesNotation?: boolean
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
        countLabel={countLabel}
        onBlur={onBlur}
        onUpdate={onUpdate}
      />

      {!facesNotation ? (
        <>
          <div aria-hidden className={inputSelectDividerVariants()} />

          <InlineSentenceConnector size={size} tone="mono" aria-hidden>
            d
          </InlineSentenceConnector>

          <div aria-hidden className={inputSelectDividerVariants()} />
        </>
      ) : (
        <div aria-hidden className={inputSelectDividerVariants()} />
      )}

      <DiceFormulaFacesControl
        id={facesId}
        size={size}
        resolved={resolved}
        faces={faces}
        disabled={disabled}
        hasError={hasError}
        facesLabel={facesLabel}
        facesNotation={facesNotation}
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

type DiceFormulaModifierSegmentProps = {
  operatorId: string
  modifierId: string
  currencyId: string
  size: FieldSize
  resolved: DiceFormulaValue
  disabled: boolean
  hasError: boolean
  modifierMin: number
  modifierMax: number
  modifierOperators: readonly DiceFormulaTailOperator[]
  modifierAmountLabel: string
  currencyUnit?: DiceFormulaControlsProps['currencyUnit']
  onBlur?: () => void
  onUpdate: (patch: DiceFormulaPatch) => void
}

function DiceFormulaOperatorSegment({
  operatorId,
  size,
  resolved,
  disabled,
  hasError,
  modifierOperators,
  operatorLabel = 'Operator',
  onBlur,
  onUpdate,
}: Pick<
  DiceFormulaModifierSegmentProps,
  | 'operatorId'
  | 'size'
  | 'resolved'
  | 'disabled'
  | 'hasError'
  | 'modifierOperators'
  | 'onBlur'
  | 'onUpdate'
> & {
  operatorLabel?: string
}) {
  const singleOperator = modifierOperators.length === 1
  const resolvedOperator = resolved.modifier?.operator ?? modifierOperators[0] ?? '+'

  if (singleOperator) {
    return <DiceFormulaStaticOperator operator={resolvedOperator} size={size} />
  }

  return (
    <DiceFormulaControlCell id={operatorId} label={operatorLabel}>
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
  )
}

function DiceFormulaModifierAmountSegment({
  modifierId,
  size,
  resolved,
  resolvedOperator,
  disabled,
  hasError,
  modifierMin,
  modifierMax,
  modifierAmountLabel,
  onBlur,
  onUpdate,
}: Pick<
  DiceFormulaModifierSegmentProps,
  | 'modifierId'
  | 'size'
  | 'resolved'
  | 'disabled'
  | 'hasError'
  | 'modifierMin'
  | 'modifierMax'
  | 'modifierAmountLabel'
  | 'onBlur'
  | 'onUpdate'
> & { resolvedOperator: DiceFormulaTailOperator }) {
  return (
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
  )
}

function DiceFormulaCurrencySegment({
  currencyId,
  size,
  disabled,
  hasError,
  currencyUnit,
  onBlur,
}: Pick<
  DiceFormulaModifierSegmentProps,
  'currencyId' | 'size' | 'disabled' | 'hasError' | 'currencyUnit' | 'onBlur'
>) {
  if (!currencyUnit) return null

  return (
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
  operatorLabel,
  currencyUnit,
  onBlur,
  onUpdate,
  onRemoveModifier,
}: DiceFormulaModifierSegmentProps & {
  modifierMode: DiceFormulaModifierMode
  operatorLabel?: string
  onRemoveModifier: () => void
}) {
  const singleOperator = modifierOperators.length === 1
  const resolvedOperator = resolved.modifier?.operator ?? modifierOperators[0] ?? '+'

  return (
    <>
      <div className={diceFormulaModifierGroupVariants({ invalid: hasError, disabled })}>
        <DiceFormulaOperatorSegment
          operatorId={operatorId}
          size={size}
          resolved={resolved}
          disabled={disabled}
          hasError={hasError}
          modifierOperators={modifierOperators}
          operatorLabel={operatorLabel}
          onBlur={onBlur}
          onUpdate={onUpdate}
        />

        {!singleOperator ? <div aria-hidden className={inputSelectDividerVariants()} /> : null}

        <DiceFormulaModifierAmountSegment
          modifierId={modifierId}
          size={size}
          resolved={resolved}
          resolvedOperator={resolvedOperator}
          disabled={disabled}
          hasError={hasError}
          modifierMin={modifierMin}
          modifierMax={modifierMax}
          modifierAmountLabel={modifierAmountLabel}
          onBlur={onBlur}
          onUpdate={onUpdate}
        />

        <DiceFormulaCurrencySegment
          currencyId={currencyId}
          size={size}
          disabled={disabled}
          hasError={hasError}
          currencyUnit={currencyUnit}
          onBlur={onBlur}
        />
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

function DiceFormulaAddActionButton({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="shrink-0 px-2"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

function DiceFormulaDiceSegment({
  showDiceFields,
  onAddDice,
  addDiceLabel,
  disabled,
  coreProps,
}: {
  showDiceFields: boolean
  onAddDice?: () => void
  addDiceLabel: string
  disabled: boolean
  coreProps: ComponentProps<typeof DiceFormulaCoreControls>
}) {
  if (showDiceFields) {
    return <DiceFormulaCoreControls {...coreProps} />
  }

  if (!onAddDice) return null

  return <DiceFormulaAddActionButton label={addDiceLabel} disabled={disabled} onClick={onAddDice} />
}

function DiceFormulaTailSegment({
  showModifierFields,
  showDiceFields,
  modifierMode,
  modifierOperators,
  disabled,
  onUpdate,
  modifierProps,
}: {
  showModifierFields: boolean
  showDiceFields: boolean
  modifierMode: DiceFormulaModifierMode
  modifierOperators: readonly DiceFormulaTailOperator[]
  disabled: boolean
  onUpdate: (patch: DiceFormulaPatch) => void
  modifierProps: ComponentProps<typeof DiceFormulaModifierControls> & {
    onRemoveModifier: () => void
  }
}) {
  if (showModifierFields) {
    return <DiceFormulaModifierControls {...modifierProps} />
  }

  if (modifierMode !== 'optional' || !showDiceFields) return null

  return (
    <DiceFormulaAddActionButton
      label={ADD_MODIFIER_LABEL}
      disabled={disabled}
      onClick={() => onUpdate({ modifier: defaultModifierForOperators(modifierOperators) })}
    />
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
  showDiceFields = true,
  countMin,
  countMax,
  modifierMin,
  modifierMax,
  modifierOperators = DICE_FORMULA_OPERATORS,
  modifierAmountLabel = 'Modifier',
  controlLabels,
  facesNotation = false,
  onAddDice,
  addDiceLabel = ADD_DICE_LABEL,
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
  const countLabel = controlLabels?.count ?? 'Count'
  const facesLabel = controlLabels?.faces ?? 'Die faces'
  const operatorLabel = controlLabels?.operator ?? 'Operator'
  const resolvedModifierAmountLabel = controlLabels?.modifierAmount ?? modifierAmountLabel

  return (
    <InlineSentenceRow
      role={labelPosition === 'inline' ? 'group' : undefined}
      aria-labelledby={labelPosition === 'inline' ? inlineLabelId : undefined}
    >
      <DiceFormulaDiceSegment
        showDiceFields={showDiceFields}
        onAddDice={onAddDice}
        addDiceLabel={addDiceLabel}
        disabled={disabled}
        coreProps={{
          countId,
          facesId,
          size,
          resolved,
          faces,
          disabled,
          hasError,
          countMin,
          countMax,
          countLabel,
          facesLabel,
          facesNotation,
          onBlur,
          onUpdate,
        }}
      />

      <DiceFormulaTailSegment
        showModifierFields={showModifierFields}
        showDiceFields={showDiceFields}
        modifierMode={modifierMode}
        modifierOperators={modifierOperators}
        disabled={disabled}
        onUpdate={onUpdate}
        modifierProps={{
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
          modifierAmountLabel: resolvedModifierAmountLabel,
          operatorLabel,
          currencyUnit,
          onBlur,
          onUpdate,
          onRemoveModifier: () => onUpdate({ clearModifier: true }),
        }}
      />
    </InlineSentenceRow>
  )
}
