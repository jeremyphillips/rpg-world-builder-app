import { describe, expect, it } from 'vitest'

import {
  ICON_GLYPH_STEPS,
  iconGlyphDescendantClasses,
  iconGlyphDirectChildClasses,
} from './icon-glyph.variants'

describe('iconGlyph variants', () => {
  it('defines xs through 3xl steps with matching descendant utilities', () => {
    for (const step of ICON_GLYPH_STEPS) {
      expect(iconGlyphDescendantClasses[step]).toBe(`[&_svg]:size-icon-glyph-${step}`)
      expect(iconGlyphDirectChildClasses[step]).toBe(`[&>svg]:size-icon-glyph-${step}`)
    }
  })
})
