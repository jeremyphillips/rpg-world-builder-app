import { describe, expect, it } from 'vitest'

import { isStepDisabled, parseNumberInput, stepNumber } from './number-input.lib'

describe('parseNumberInput', () => {
  it('returns undefined for blank input', () => {
    expect(parseNumberInput('')).toBeUndefined()
    expect(parseNumberInput('   ')).toBeUndefined()
  })

  it('returns undefined for non-numeric input', () => {
    expect(parseNumberInput('abc')).toBeUndefined()
  })

  it('parses numeric strings', () => {
    expect(parseNumberInput('12')).toBe(12)
    expect(parseNumberInput('-3')).toBe(-3)
  })
})

describe('stepNumber', () => {
  it('increments and decrements from a numeric value', () => {
    expect(stepNumber(5, 'up', { step: 1 })).toBe(6)
    expect(stepNumber(5, 'down', { step: 1 })).toBe(4)
  })

  it('respects min and max bounds', () => {
    expect(stepNumber(20, 'up', { min: 1, max: 20 })).toBe(20)
    expect(stepNumber(1, 'down', { min: 1, max: 20 })).toBe(1)
  })

  it('seeds from bounds when the field is empty', () => {
    expect(stepNumber(undefined, 'up', { min: 1, max: 20 })).toBe(1)
    expect(stepNumber(undefined, 'down', { min: 1, max: 20 })).toBe(20)
  })
})

describe('isStepDisabled', () => {
  it('disables increment at max and decrement at min', () => {
    expect(isStepDisabled(20, 'up', { min: 1, max: 20 })).toBe(true)
    expect(isStepDisabled(20, 'down', { min: 1, max: 20 })).toBe(false)
    expect(isStepDisabled(1, 'down', { min: 1, max: 20 })).toBe(true)
  })
})
