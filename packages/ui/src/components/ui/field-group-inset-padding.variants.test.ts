import { describe, expect, it } from 'vitest'

import { resolveFormInsetPaddingClasses } from './field.variants'

describe('resolveFormInsetPaddingClasses', () => {
  it('uses comfortable dependent content inset by default', () => {
    expect(resolveFormInsetPaddingClasses()).toBe('pl-9')
    expect(resolveFormInsetPaddingClasses('comfortable')).toBe('pl-9')
    expect(resolveFormInsetPaddingClasses('comfortable', 'all')).toBe('p-9')
  })

  it('uses compact dependent content inset', () => {
    expect(resolveFormInsetPaddingClasses('compact')).toBe('pl-8')
    expect(resolveFormInsetPaddingClasses('compact', 'all')).toBe('p-8')
  })
})
