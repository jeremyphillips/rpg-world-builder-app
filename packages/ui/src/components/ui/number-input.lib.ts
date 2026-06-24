export function parseNumberInput(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? undefined : parsed
}

function clampNumber(value: number, min?: number, max?: number): number {
  let next = value
  if (min !== undefined) next = Math.max(min, next)
  if (max !== undefined) next = Math.min(max, next)
  return next
}

export interface StepNumberOptions {
  step?: number
  min?: number
  max?: number
}

export function resolveNumberBounds(
  inputMin: number | undefined,
  inputMax: number | undefined,
  stepperMin: number | undefined,
  stepperMax: number | undefined,
): { min?: number; max?: number } {
  return {
    min: stepperMin ?? inputMin,
    max: stepperMax ?? inputMax,
  }
}

export function stepNumber(
  raw: string | number | undefined,
  direction: 'up' | 'down',
  { step = 1, min, max }: StepNumberOptions,
): number {
  const current =
    typeof raw === 'number' ? raw : raw === undefined ? undefined : parseNumberInput(String(raw))

  if (current === undefined) {
    const seed = direction === 'up' ? (min ?? step) : (max ?? 0)
    return clampNumber(seed, min, max)
  }

  const delta = direction === 'up' ? step : -step
  return clampNumber(current + delta, min, max)
}

export function isStepDisabled(
  raw: string | number | undefined,
  direction: 'up' | 'down',
  options: StepNumberOptions,
): boolean {
  const current =
    typeof raw === 'number' ? raw : raw === undefined ? undefined : parseNumberInput(String(raw))
  const next = stepNumber(raw, direction, options)
  if (current === undefined) return false
  return next === current
}
