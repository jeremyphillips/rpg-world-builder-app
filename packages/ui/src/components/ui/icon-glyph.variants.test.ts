import { describe, expect, it } from 'vitest'

import {
  ICON_GLYPH_STEPS,
  iconGlyphDescendantClasses,
  iconGlyphDirectChildClasses,
  iconGlyphRootClasses,
} from './icon-glyph.variants'

describe('iconGlyph variants', () => {
  it('defines xs/sm/md/lg steps with matching root and descendant utilities', () => {
    for (const step of ICON_GLYPH_STEPS) {
      expect(iconGlyphRootClasses[step]).toBe(`size-icon-glyph-${step}`)
      expect(iconGlyphDescendantClasses[step]).toBe(`[&_svg]:size-icon-glyph-${step}`)
      expect(iconGlyphDirectChildClasses[step]).toBe(`[&>svg]:size-icon-glyph-${step}`)
    }
  })
})
