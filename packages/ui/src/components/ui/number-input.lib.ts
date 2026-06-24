import type { ChangeEvent } from 'react'
import { formatGroupedNumber, parseGroupedNumber } from '@rpg/contracts/primitives'

export function parseNumberInput(raw: string, grouped = false): number | undefined {
  if (raw.trim() === '') return undefined
  const normalized = grouped ? raw.replaceAll(',', '') : raw
  const parsed = Number(normalized)
  return Number.isNaN(parsed) ? undefined : parsed
}

export function normalizeInputValue(
  raw: string | number | readonly string[] | undefined,
): string | number | undefined {
  if (raw === undefined) return undefined
  if (typeof raw === 'number' || typeof raw === 'string') return raw
  return raw[0]
}

export function groupedDisplayValue(raw: string | number | undefined): string {
  if (raw === undefined || raw === '') return ''
  if (typeof raw === 'number') return formatGroupedNumber(raw)
  const parsed = parseGroupedNumber(raw)
  return parsed === undefined ? raw : formatGroupedNumber(parsed)
}

export function createSyntheticNumberChangeEvent(
  next: number | undefined,
): ChangeEvent<HTMLInputElement> {
  const nextValue = next === undefined ? '' : String(next)
  return {
    target: { value: nextValue },
    currentTarget: { value: nextValue },
  } as ChangeEvent<HTMLInputElement>
}

export function restoreGroupedInputCursor(
  input: HTMLInputElement | null,
  parsed: number | undefined,
  digitsBefore: number,
): void {
  if (!input) return
  const formatted = parsed === undefined ? '' : formatGroupedNumber(parsed)
  const nextCursor = cursorPositionAfterDigits(formatted, digitsBefore)
  input.setSelectionRange(nextCursor, nextCursor)
}

export function dispatchNativeNumberStep(input: HTMLInputElement, next: number): void {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  valueSetter?.call(input, String(next))
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
  input.focus()
}

export function buildStepOptions(
  step: number | string | undefined,
  min: number | string | undefined,
  max: number | string | undefined,
  stepperMin: number | undefined,
  stepperMax: number | undefined,
  formatGrouped: boolean,
): StepNumberOptions {
  const bounds = resolveNumberBounds(
    typeof min === 'number' ? min : undefined,
    typeof max === 'number' ? max : undefined,
    stepperMin,
    stepperMax,
  )
  return {
    step: Number(step) || 1,
    grouped: formatGrouped,
    ...bounds,
  }
}

export interface NumberInputFieldBinding {
  type: 'text' | 'number'
  inputMode: 'decimal' | 'numeric'
  value: string | number | readonly string[] | undefined
  defaultValue: string | number | readonly string[] | undefined
  min: number | string | undefined
  max: number | string | undefined
  step: number | string | undefined
}

export function resolveNumberInputFieldBinding(options: {
  formatGrouped: boolean
  value: string | number | readonly string[] | undefined
  defaultValue: string | number | readonly string[] | undefined
  currentValue: string | number | undefined
  min: number | string | undefined
  max: number | string | undefined
  step: number | string | undefined
}): NumberInputFieldBinding {
  const { formatGrouped, value, defaultValue, currentValue, min, max, step } = options
  if (!formatGrouped) {
    return { type: 'number', inputMode: 'numeric', value, defaultValue, min, max, step }
  }
  return {
    type: 'text',
    inputMode: 'decimal',
    value: groupedDisplayValue(currentValue),
    defaultValue: undefined,
    min: undefined,
    max: undefined,
    step: undefined,
  }
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
  grouped?: boolean
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
  { step = 1, min, max, grouped = false }: StepNumberOptions,
): number {
  const current =
    typeof raw === 'number'
      ? raw
      : raw === undefined
        ? undefined
        : parseNumberInput(String(raw), grouped)

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
  const { grouped = false } = options
  const current =
    typeof raw === 'number'
      ? raw
      : raw === undefined
        ? undefined
        : parseNumberInput(String(raw), grouped)
  const next = stepNumber(raw, direction, options)
  if (current === undefined) return false
  return next === current
}

/** Counts digit characters before `cursorPos` in `raw`. */
export function countDigitsBefore(raw: string, cursorPos: number): number {
  let count = 0
  for (let i = 0; i < cursorPos && i < raw.length; i++) {
    if (/\d/.test(raw[i]!)) count++
  }
  return count
}

/** Returns the cursor index after `digitCount` digits in a formatted string. */
export function cursorPositionAfterDigits(formatted: string, digitCount: number): number {
  if (digitCount === 0) return 0
  let digits = 0
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]!)) {
      digits++
      if (digits === digitCount) return i + 1
    }
  }
  return formatted.length
}
