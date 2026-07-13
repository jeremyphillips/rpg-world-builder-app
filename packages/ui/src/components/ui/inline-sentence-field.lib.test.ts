import { describe, expect, it } from 'vitest'

import {
  coerceInlineSentenceSelectValue,
  inlineSentenceSelectOptionsAreNumeric,
  inlineSentenceSelectTriggerWidthClasses,
  resolveInlineSentenceSelectChange,
} from './inline-sentence-field.lib'

describe('inlineSentenceSelectTriggerWidthClasses', () => {
  it('defaults to auto intrinsic sizing', () => {
    expect(inlineSentenceSelectTriggerWidthClasses(undefined)).toContain('w-fit')
    expect(inlineSentenceSelectTriggerWidthClasses(undefined)).toContain('shrink-0')
  })

  it('maps intrinsic width tokens to explicit inline widths', () => {
    expect(inlineSentenceSelectTriggerWidthClasses('lg')).toContain('w-48')
    expect(inlineSentenceSelectTriggerWidthClasses('lg')).toContain('max-w-48')
    expect(inlineSentenceSelectTriggerWidthClasses('xl')).toContain('w-64')
  })
})

describe('inline sentence numeric select coercion', () => {
  const dieFaceOptions = [
    { value: '4', label: '4' },
    { value: '6', label: '6' },
    { value: '10', label: '10' },
  ]

  it('coerces stored numbers to string select values', () => {
    expect(coerceInlineSentenceSelectValue(10)).toBe('10')
    expect(coerceInlineSentenceSelectValue('6')).toBe('6')
    expect(coerceInlineSentenceSelectValue(undefined)).toBeUndefined()
  })

  it('detects numeric option lists', () => {
    expect(inlineSentenceSelectOptionsAreNumeric(dieFaceOptions)).toBe(true)
    expect(
      inlineSentenceSelectOptionsAreNumeric([{ value: 'increase', label: 'increases by' }]),
    ).toBe(false)
  })

  it('writes numbers back for numeric option lists', () => {
    expect(resolveInlineSentenceSelectChange('10', dieFaceOptions)).toBe(10)
    expect(
      resolveInlineSentenceSelectChange('default', [{ value: 'default', label: 'Default' }]),
    ).toBe('default')
  })
})
