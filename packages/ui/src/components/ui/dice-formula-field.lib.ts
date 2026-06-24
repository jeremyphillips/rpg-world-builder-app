export type DiceFormulaOperator = '+' | '-'

export interface DiceFormulaModifier {
  operator: DiceFormulaOperator
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

export const DICE_FORMULA_OPERATORS: readonly DiceFormulaOperator[] = ['+', '-']

export type DiceFormulaPatch = Partial<DiceFormulaValue> & { clearModifier?: boolean }

export function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)))
}

export function parseInputInt(raw: string, fallback: number, min: number, max: number): number {
  if (raw.trim() === '') return fallback
  const parsed = Number(raw)
  if (Number.isNaN(parsed)) return fallback
  return clampInt(parsed, min, max)
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
): DiceFormulaValue {
  const next: DiceFormulaValue = {
    count: patch.count ?? resolved.count,
    faces: patch.faces ?? resolved.faces,
  }

  if (modifierMode === 'required') {
    next.modifier = patch.clearModifier
      ? { ...DEFAULT_DICE_FORMULA_MODIFIER }
      : (patch.modifier ?? resolved.modifier ?? { ...DEFAULT_DICE_FORMULA_MODIFIER })
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

export function defaultDiceFormulaForMode(mode: DiceFormulaModifierMode): DiceFormulaValue {
  return mode === 'required'
    ? { ...DEFAULT_DICE_FORMULA_WITH_MODIFIER }
    : { ...DEFAULT_DICE_FORMULA_VALUE }
}

/** Formats a dice formula for display (e.g. `1d8`, `2d6+3`, `1d4-1`). */
export function formatDiceFormula(value: DiceFormulaValue): string {
  const base = `${value.count}d${value.faces}`
  if (!value.modifier) return base
  return `${base}${value.modifier.operator}${value.modifier.amount}`
}

export function resolveDiceFormulaValue(
  value: DiceFormulaValue | undefined,
  modifierMode: DiceFormulaModifierMode,
  faces: readonly number[],
): DiceFormulaValue {
  const fallback = defaultDiceFormulaForMode(modifierMode)
  const resolved: DiceFormulaValue = {
    count: value?.count ?? fallback.count,
    faces: value?.faces ?? fallback.faces,
  }

  const faceFallback = faces.includes(resolved.faces) ? resolved.faces : faces[0]!
  resolved.faces = faceFallback

  if (modifierMode === 'required') {
    resolved.modifier = value?.modifier ?? fallback.modifier ?? { ...DEFAULT_DICE_FORMULA_MODIFIER }
  } else if (modifierMode === 'optional' && value?.modifier) {
    resolved.modifier = value.modifier
  }

  return resolved
}
