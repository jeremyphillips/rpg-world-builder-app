import { isRollFlatAmountPresent, ROLL_FLAT_OPERATORS, type RollFlatOperator } from '@rpg/contracts'
import type { DieFace } from '@rpg/contracts/primitives'

import {
  DICE_FORMULA_OPERATORS,
  type DiceFormulaPatch,
  type DiceFormulaTailOperator,
  type DiceFormulaValue,
} from './dice-formula-field.lib'

export { ROLL_FLAT_OPERATORS, type RollFlatOperator }
export { isRollFlatAmountPresent, joinSignedRollFlat, splitSignedRollFlat } from '@rpg/contracts'

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

/**
 * Whether the dice core should render.
 * A roll with no stored dice atoms uses Add dice instead of a filled suggestion.
 * A partial core stays visible so the missing atom is not painted as stored.
 */
export function shouldShowRollValueDiceFields(parts: RollValueFieldParts): boolean {
  return parts.diceCount !== undefined || parts.diceFaces !== undefined
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

/** Writes only the atom the author changed. Add dice commits both defaults separately. */
export function applyRollValueFieldPatch(
  _parts: RollValueFieldParts,
  patch: DiceFormulaPatch,
  _fieldDefaults: RollValueFieldDefaults,
): RollValueFieldPatchResult {
  if (patch.clearModifier) {
    return { clearFlat: true }
  }

  const next: RollValueFieldPatchResult = {}

  if (patch.count !== undefined) next.diceCount = patch.count
  if (patch.faces !== undefined) next.diceFaces = patch.faces

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
