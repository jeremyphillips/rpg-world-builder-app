import { describe, expect, it, vi } from 'vitest'

import {
  applyMagnitudeToSignedValue,
  numberStepperMagnitude,
  numberStepperSignPrefixChar,
  numberStepperSignedValueText,
  resolveNumberStepperSignDisplay,
  warnIfPositivePrefixWithNegativeMin,
} from './number-stepper-sign-display.lib'

describe('numberStepperSignDisplay', () => {
  it('defaults to plain when signDisplay is omitted', () => {
    expect(resolveNumberStepperSignDisplay()).toBe('plain')
    expect(resolveNumberStepperSignDisplay('signed-prefix')).toBe('signed-prefix')
  })

  it('maps sign prefix and magnitude for signed values', () => {
    expect(numberStepperSignPrefixChar(3)).toBe('+')
    expect(numberStepperSignPrefixChar(-2)).toBe('−')
    expect(numberStepperMagnitude(-2)).toBe(2)
    expect(applyMagnitudeToSignedValue(-5, 3)).toBe(-3)
    expect(applyMagnitudeToSignedValue(5, 3)).toBe(3)
  })

  it('formats signed value text for aria-valuetext', () => {
    expect(numberStepperSignedValueText(0)).toBe('+0')
    expect(numberStepperSignedValueText(4)).toBe('+4')
    expect(numberStepperSignedValueText(-1)).toBe('-1')
  })

  it('warns when positive-prefix is paired with a negative min', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    warnIfPositivePrefixWithNegativeMin('positive-prefix', -10)
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })
})
