import { describe, expect, it } from 'vitest'

import { resolveFieldGroupInsetPaddingClasses } from './field.variants'

describe('resolveFieldGroupInsetPaddingClasses', () => {
  it('uses comfortable density by default', () => {
    expect(resolveFieldGroupInsetPaddingClasses()).toBe('pl-4 sm:pl-8')
    expect(resolveFieldGroupInsetPaddingClasses('comfortable')).toBe('pl-4 sm:pl-8')
  })

  it('uses compact density', () => {
    expect(resolveFieldGroupInsetPaddingClasses('compact')).toBe('pl-4 sm:pl-5')
  })
})
