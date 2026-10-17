import { parseNumberInput } from './number-input.lib'
import {
  applyMagnitudeToSignedValue,
  type NumberStepperSignDisplay,
} from './number-stepper-sign-display.lib'

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function parseNumberStepperChangeValue(args: {
  rawValue: string
  signDisplay: NumberStepperSignDisplay
  resolvedValue: number
  min: number
  max: number
}): number {
  const { rawValue, signDisplay, resolvedValue, min, max } = args

  if (signDisplay === 'signed-prefix') {
    const parsed = parseNumberInput(rawValue, false)
    if (parsed === undefined) return min
    return clampNumber(applyMagnitudeToSignedValue(resolvedValue, parsed), min, max)
  }

  const next = Number(rawValue)
  return Number.isFinite(next) ? clampNumber(next, min, max) : min
}
