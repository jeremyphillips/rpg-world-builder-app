import { describe, expect, it } from 'vitest'

import { resolveButtonIconGlyphStep } from './resolve-button-icon-glyph-step'

describe('resolveButtonIconGlyphStep', () => {
  it('maps dense chrome sizes to xs and sm', () => {
    expect(resolveButtonIconGlyphStep('xs', 'default', 'outline')).toBe('xs')
    expect(resolveButtonIconGlyphStep('sm', 'default', 'outline')).toBe('sm')
    expect(resolveButtonIconGlyphStep('sm', 'compact', 'outline')).toBe('sm')
  })

  it('maps text xs compact to xs and text xs default to sm', () => {
    expect(resolveButtonIconGlyphStep('xs', 'compact', 'text')).toBe('xs')
    expect(resolveButtonIconGlyphStep('xs', 'default', 'text')).toBe('sm')
  })

  it('keeps default chrome on lg', () => {
    expect(resolveButtonIconGlyphStep('default', 'default', 'default')).toBe('lg')
    expect(resolveButtonIconGlyphStep('lg', 'default', 'text')).toBe('lg')
  })
})
