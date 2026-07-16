import type { DieFace } from '@rpg/contracts/primitives'

import {
  DICE_FORMULA_OPERATORS,
  type DiceFormulaPatch,
  type DiceFormulaTailOperator,
  type DiceFormulaValue,
} from './dice-formula-field.lib'

export const ROLL_FLAT_OPERATORS = ['+', '-'] as const

export type RollFlatOperator = (typeof ROLL_FLAT_OPERATORS)[number]

const EMPTY_NUMBER_SENTINEL = '' as unknown as number

export function isRollFlatAmountPresent(amount: unknown): boolean {
  return (
    amount !== undefined && amount !== null && amount !== EMPTY_NUMBER_SENTINEL && amount !== ''
  )
}

export function splitSignedRollFlat(flat: number | undefined): {
  flatOperator: RollFlatOperator
  flatAmount?: number
} {
  if (flat === undefined) {
    return { flatOperator: '+' }
  }

  return {
    flatOperator: flat >= 0 ? '+' : '-',
    flatAmount: Math.abs(flat),
  }
}

export function joinSignedRollFlat(
  operator: RollFlatOperator | undefined,
  amount: number | undefined,
): number | undefined {
  if (!isRollFlatAmountPresent(amount)) return undefined

  const magnitude = Math.abs(Number(amount))
  if (magnitude === 0) return undefined

  return operator === '-' ? -magnitude : magnitude
}

export type RollValueFieldParts = {
  diceCount?: number
  diceFaces?: number
  flatOperator?: RollFlatOperator
  flatAmount?: number
}

export type RollValueFieldDefaults = {
  count: number
  faces: number
}

export function resolveRollValueFieldDefaults(
  defaults: Partial<RollValueFieldDefaults> | undefined,
  allowedFaces: readonly number[],
): RollValueFieldDefaults {
  const count = defaults?.count ?? 1
  const requestedFaces = defaults?.faces ?? 6
  const faces = allowedFaces.includes(requestedFaces) ? requestedFaces : (allowedFaces[0] ?? 6)

  return { count, faces }
}

export function rollValuePartsHaveDice(parts: RollValueFieldParts): boolean {
  return parts.diceCount !== undefined && parts.diceFaces !== undefined
}

export function rollValuePartsHaveFlat(parts: RollValueFieldParts): boolean {
  return isRollFlatAmountPresent(parts.flatAmount)
}

/** Whether the dice core (`XdY`) should render for the current roll parts. */
export function shouldShowRollValueDiceFields(parts: RollValueFieldParts): boolean {
  return rollValuePartsHaveDice(parts) || !rollValuePartsHaveFlat(parts)
}

/** Whether flat operator + amount controls should render. */
export function shouldShowRollValueModifierFields(parts: RollValueFieldParts): boolean {
  return rollValuePartsHaveFlat(parts)
}

export function rollValuePartsToDiceFormula(
  parts: RollValueFieldParts,
  fieldDefaults: RollValueFieldDefaults,
): DiceFormulaValue {
  const hasDice = rollValuePartsHaveDice(parts)
  const resolved: DiceFormulaValue = {
    count: hasDice ? parts.diceCount! : fieldDefaults.count,
    faces: hasDice ? parts.diceFaces! : fieldDefaults.faces,
  }

  if (rollValuePartsHaveFlat(parts)) {
    resolved.modifier = {
      operator: (parts.flatOperator ?? '+') as DiceFormulaTailOperator,
      amount: Number(parts.flatAmount),
    }
  }

  return resolved
}

export type RollValueFieldPatchResult = {
  diceCount?: number
  diceFaces?: number
  flatOperator?: RollFlatOperator
  flatAmount?: number
  clearDice?: boolean
  clearFlat?: boolean
}

export function applyRollValueFieldPatch(
  parts: RollValueFieldParts,
  patch: DiceFormulaPatch,
  fieldDefaults: RollValueFieldDefaults,
): RollValueFieldPatchResult {
  if (patch.clearModifier) {
    return { clearFlat: true }
  }

  const next: RollValueFieldPatchResult = {}

  if (patch.count !== undefined || patch.faces !== undefined) {
    const resolved = rollValuePartsToDiceFormula(parts, fieldDefaults)
    next.diceCount = patch.count ?? resolved.count
    next.diceFaces = patch.faces ?? resolved.faces
  }

  if (patch.modifier !== undefined) {
    next.flatOperator = patch.modifier.operator as RollFlatOperator
    next.flatAmount = patch.modifier.amount
  }

  return next
}

export function defaultRollValueModifier(): {
  flatOperator: RollFlatOperator
  flatAmount: number
} {
  return { flatOperator: '+', flatAmount: 0 }
}

export function defaultRollValueDice(defaults: RollValueFieldDefaults): {
  diceCount: number
  diceFaces: number
} {
  return { diceCount: defaults.count, diceFaces: defaults.faces }
}

export const ROLL_VALUE_MODIFIER_OPERATORS: readonly DiceFormulaTailOperator[] =
  DICE_FORMULA_OPERATORS

export type RollValueDefaultFaces = DieFace | number
