import { describe, expect, it } from 'vitest'

import {
  contentCardIdentityColumnGapVariants,
  contentCardMediaEndGapVariants,
  resolveContentCardIdentityColumnGapClasses,
} from './content-card.variants'

describe('contentCardIdentityColumnGapVariants', () => {
  it('maps compact to gap-2 and comfortable to gap-4', () => {
    expect(contentCardIdentityColumnGapVariants({ density: 'compact' })).toContain('gap-2')
    expect(contentCardIdentityColumnGapVariants({ density: 'comfortable' })).toContain('gap-4')
    expect(resolveContentCardIdentityColumnGapClasses('comfortable')).toContain('gap-4')
  })

  it('adds 8px after compact media so image-to-copy is 16px without widening the end slot', () => {
    expect(contentCardMediaEndGapVariants({ density: 'compact' })).toContain('me-2')
    expect(contentCardMediaEndGapVariants({ density: 'comfortable' })).not.toContain('me-')
  })
})
