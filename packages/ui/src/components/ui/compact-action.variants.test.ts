import { describe, expect, it } from 'vitest'

import {
  compactActionHeightClasses,
  compactActionIconGlyphClasses,
  compactActionSizeClasses,
} from './compact-action.variants'

describe('compactAction variants', () => {
  it('references the shared compact action height utility', () => {
    expect(compactActionHeightClasses).toBe('h-control-action-compact')
    expect(compactActionSizeClasses).toBe('size-control-action-compact')
    expect(compactActionIconGlyphClasses).toBe('[&_svg]:size-3')
  })
})
