import { describe, expect, it } from 'vitest'

import {
  groupedDisplayValue,
  isStepDisabled,
  normalizeInputValue,
  parseNumberInput,
  resolveNumberInputFieldBinding,
  stepNumber,
} from './number-input.lib'

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

  it('strips grouping separators when grouped parsing is enabled', () => {
    expect(parseNumberInput('3,000', true)).toBe(3000)
    expect(parseNumberInput('3,00', true)).toBe(300)
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

describe('normalizeInputValue', () => {
  it('returns the first array entry for array values', () => {
    expect(normalizeInputValue(['12'])).toBe('12')
  })
})

describe('groupedDisplayValue', () => {
  it('formats numeric values with grouping', () => {
    expect(groupedDisplayValue(3000)).toBe('3,000')
    expect(groupedDisplayValue(undefined)).toBe('')
  })
})

describe('resolveNumberInputFieldBinding', () => {
  it('uses text input settings when formatGrouped is enabled', () => {
    expect(
      resolveNumberInputFieldBinding({
        formatGrouped: true,
        value: 3000,
        defaultValue: undefined,
        currentValue: 3000,
        min: 0,
        max: 10,
        step: 1,
      }),
    ).toMatchObject({
      type: 'text',
      inputMode: 'decimal',
      value: '3,000',
      min: undefined,
    })
  })
})
