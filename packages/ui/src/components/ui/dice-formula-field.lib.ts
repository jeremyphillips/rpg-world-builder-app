/** All supported dice-formula tail operators. */
export const DICE_FORMULA_TAIL_OPERATORS = ['+', '-', '×', '÷'] as const

export type DiceFormulaTailOperator = (typeof DICE_FORMULA_TAIL_OPERATORS)[number]

/** @deprecated Prefer `DiceFormulaTailOperator` — kept for existing imports. */
export type DiceFormulaOperator = DiceFormulaTailOperator

export interface DiceFormulaModifier {
  operator: DiceFormulaTailOperator
  amount: number
}

export interface DiceFormulaValue {
  count: number
  faces: number
  modifier?: DiceFormulaModifier
}

export const DEFAULT_DICE_FORMULA_VALUE: DiceFormulaValue = { count: 1, faces: 6 }

export const DEFAULT_DICE_FORMULA_MODIFIER: DiceFormulaModifier = { operator: '+', amount: 1 }

export const DEFAULT_DICE_FORMULA_WITH_MODIFIER: DiceFormulaValue = {
  count: 1,
  faces: 6,
  modifier: { ...DEFAULT_DICE_FORMULA_MODIFIER },
}

export type DiceFormulaModifierMode = 'none' | 'optional' | 'required'

export type DiceFormulaLabelPosition = 'above' | 'inline'

/** Default flat-modifier operators for hit dice and similar controls. */
export const DICE_FORMULA_OPERATORS: readonly DiceFormulaTailOperator[] = ['+', '-']

export type DiceFormulaPatch = Partial<DiceFormulaValue> & { clearModifier?: boolean }

export interface DiceFormulaCurrencyUnitOption {
  label: string
  value: string
}

export function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)))
}

export function parseInputInt(raw: string, fallback: number, min: number, max: number): number {
  if (raw.trim() === '') return fallback
  const parsed = Number(raw)
  if (Number.isNaN(parsed)) return fallback
  return clampInt(parsed, min, max)
}

export function defaultModifierForOperators(
  operators: readonly DiceFormulaTailOperator[],
): DiceFormulaModifier {
  const operator = operators[0] ?? '+'
  return { operator, amount: 1 }
}

export function stripDiceFormulaModifier(value: DiceFormulaValue): DiceFormulaValue {
  const { modifier: _modifier, ...withoutModifier } = value
  return withoutModifier
}

export function emitDiceFormulaChange(
  next: DiceFormulaValue,
  modifierMode: DiceFormulaModifierMode,
  onChange?: (value: DiceFormulaValue) => void,
): void {
  if (!onChange) return
  onChange(modifierMode === 'none' ? stripDiceFormulaModifier(next) : next)
}

export function applyDiceFormulaPatch(
  resolved: DiceFormulaValue,
  patch: DiceFormulaPatch,
  modifierMode: DiceFormulaModifierMode,
  modifierOperators: readonly DiceFormulaTailOperator[] = DICE_FORMULA_OPERATORS,
): DiceFormulaValue {
  const next: DiceFormulaValue = {
    count: patch.count ?? resolved.count,
    faces: patch.faces ?? resolved.faces,
  }

  const defaultModifier = defaultModifierForOperators(modifierOperators)

  if (modifierMode === 'required') {
    next.modifier = patch.clearModifier
      ? { ...defaultModifier }
      : (patch.modifier ?? resolved.modifier ?? { ...defaultModifier })
    return next
  }

  if (modifierMode === 'optional') {
    if (patch.clearModifier) return next
    if (patch.modifier !== undefined) next.modifier = patch.modifier
    else if (resolved.modifier) next.modifier = resolved.modifier
  }

  return next
}

export function shouldShowModifierFields(
  modifierMode: DiceFormulaModifierMode,
  resolved: DiceFormulaValue,
): boolean {
  return modifierMode === 'required' || (modifierMode === 'optional' && Boolean(resolved.modifier))
}

export function defaultDiceFormulaForMode(
  mode: DiceFormulaModifierMode,
  modifierOperators: readonly DiceFormulaTailOperator[] = DICE_FORMULA_OPERATORS,
): DiceFormulaValue {
  if (mode === 'required') {
    return {
      count: 1,
      faces: 6,
      modifier: defaultModifierForOperators(modifierOperators),
    }
  }
  return { ...DEFAULT_DICE_FORMULA_VALUE }
}

/** Formats a dice formula for display (e.g. `1d8`, `2d6+3`, `1d10 × 250`). */
export function formatDiceFormula(value: DiceFormulaValue): string {
  const base = `${value.count}d${value.faces}`
  if (!value.modifier) return base

  const { operator, amount } = value.modifier
  if (operator === '×' || operator === '÷') {
    return `${base} ${operator} ${amount}`
  }

  return `${base}${operator}${amount}`
}

function resolveDiceFormulaModifier(
  value: DiceFormulaValue | undefined,
  modifierMode: DiceFormulaModifierMode,
  fallback: DiceFormulaValue,
  modifierOperators: readonly DiceFormulaTailOperator[],
): DiceFormulaModifier | undefined {
  if (modifierMode === 'required') {
    return value?.modifier ?? fallback.modifier ?? defaultModifierForOperators(modifierOperators)
  }

  if (modifierMode === 'optional' && value?.modifier) {
    return value.modifier
  }

  return undefined
}

function resolveDiceFormulaFaces(faces: number, allowedFaces: readonly number[]): number {
  return allowedFaces.includes(faces) ? faces : allowedFaces[0]!
}

export function resolveDiceFormulaValue(
  value: DiceFormulaValue | undefined,
  modifierMode: DiceFormulaModifierMode,
  faces: readonly number[],
  modifierOperators: readonly DiceFormulaTailOperator[] = DICE_FORMULA_OPERATORS,
): DiceFormulaValue {
  const fallback = defaultDiceFormulaForMode(modifierMode, modifierOperators)
  const resolved: DiceFormulaValue = {
    count: value?.count ?? fallback.count,
    faces: resolveDiceFormulaFaces(value?.faces ?? fallback.faces, faces),
  }

  const modifier = resolveDiceFormulaModifier(value, modifierMode, fallback, modifierOperators)
  if (modifier !== undefined) {
    resolved.modifier = modifier
  }

  return resolved
}
