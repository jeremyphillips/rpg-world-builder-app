import { describe, expect, it } from 'vitest'

import { inlineSentenceSelectTriggerWidthClasses } from './inline-sentence-field.lib'

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
