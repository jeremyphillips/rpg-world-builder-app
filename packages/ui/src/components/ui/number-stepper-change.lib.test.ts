import { describe, expect, it } from 'vitest'

import { parseNumberStepperChangeValue } from './number-stepper-change.lib'

describe('parseNumberStepperChangeValue', () => {
  it('clamps plain numeric input', () => {
    expect(
      parseNumberStepperChangeValue({
        rawValue: '12',
        signDisplay: 'plain',
        resolvedValue: 3,
        min: 1,
        max: 10,
      }),
    ).toBe(10)
  })

  it('applies sign from the current value for signed-prefix magnitude edits', () => {
    expect(
      parseNumberStepperChangeValue({
        rawValue: '3',
        signDisplay: 'signed-prefix',
        resolvedValue: -2,
        min: -10,
        max: 10,
      }),
    ).toBe(-3)
  })
})
