export type NumberStepperSignDisplay = 'plain' | 'positive-prefix' | 'signed-prefix'

export function resolveNumberStepperSignDisplay(
  signDisplay?: NumberStepperSignDisplay,
): NumberStepperSignDisplay {
  return signDisplay ?? 'plain'
}

export function numberStepperUsesPrefixedValueSlot(signDisplay: NumberStepperSignDisplay): boolean {
  return signDisplay === 'positive-prefix' || signDisplay === 'signed-prefix'
}

export function warnIfPositivePrefixWithNegativeMin(
  signDisplay: NumberStepperSignDisplay,
  min: number,
): void {
  if (process.env.NODE_ENV === 'production') return
  if (signDisplay !== 'positive-prefix') return
  if (min >= 0) return
  console.warn(
    '[NumberStepper] signDisplay="positive-prefix" must not be used when min < 0; use signDisplay="signed-prefix" instead.',
  )
}

/** Visual prefix character in the value slot (decorative; use aria-valuetext on the input). */
export function numberStepperSignPrefixChar(signedValue: number): '+' | '−' {
  return signedValue < 0 ? '−' : '+'
}

export function numberStepperMagnitude(signedValue: number): number {
  return Math.abs(signedValue)
}

export function applyMagnitudeToSignedValue(currentSigned: number, magnitude: number): number {
  const sign = currentSigned < 0 ? -1 : 1
  return sign * Math.abs(magnitude)
}

/** Human-readable signed value for assistive tech (matches domain modifier copy). */
export function numberStepperSignedValueText(signedValue: number): string {
  return signedValue >= 0 ? `+${signedValue}` : String(signedValue)
}

export function numberStepperValueSlotAriaValueText(
  signDisplay: NumberStepperSignDisplay,
  resolvedValue: number,
): string | undefined {
  if (signDisplay === 'signed-prefix') {
    return numberStepperSignedValueText(resolvedValue)
  }
  if (signDisplay === 'positive-prefix') {
    return numberStepperSignedValueText(Math.max(0, resolvedValue))
  }
  return undefined
}

export function numberStepperInputValueForBinding(
  signDisplay: NumberStepperSignDisplay,
  resolvedValue: number,
  value: number,
): number {
  return signDisplay === 'signed-prefix' ? numberStepperMagnitude(resolvedValue) : value
}
