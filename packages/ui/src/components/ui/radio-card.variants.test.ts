import { describe, expect, it } from 'vitest'

import {
  radioCardControlVariants,
  radioCardGroupGapVariants,
  radioCardVariants,
} from './radio-card.variants'

describe('radioCard surface establishment', () => {
  it('does not establish a plane on row variant', () => {
    expect(radioCardVariants({ variant: 'row' })).not.toContain('[--surface-current:')
  })

  it('uses comfortable density card padding and typography', () => {
    expect(radioCardVariants({ variant: 'card', density: 'default' })).toContain('px-4')
    expect(radioCardVariants({ variant: 'card', density: 'default' })).toContain('py-3')
    expect(radioCardVariants({ variant: 'card', density: 'default' })).not.toContain('pl-3')
  })

  it('uses compact horizontal rhythm with 12px gap and 16px controls', () => {
    expect(radioCardControlVariants({ variant: 'card', density: 'compact' })).toContain('size-4')
  })
})

describe('radioCard group layout', () => {
  it('stretches card groups to the full field width', () => {
    expect(radioCardGroupGapVariants({ variant: 'card' })).toContain('w-full')
    expect(radioCardGroupGapVariants({ variant: 'card' })).toContain('min-w-0')
  })

  it('uses 8px gap between compact card options', () => {
    expect(radioCardGroupGapVariants({ variant: 'card', density: 'compact' })).toContain('gap-2')
    expect(radioCardGroupGapVariants({ variant: 'card', density: 'default' })).toContain('gap-3')
  })

  it('uses a responsive two-column grid when columns is two', () => {
    expect(radioCardGroupGapVariants({ columns: 'two' })).toContain('grid-cols-1')
    expect(radioCardGroupGapVariants({ columns: 'two' })).toContain('@min-[32rem]:grid-cols-2')
    expect(radioCardGroupGapVariants({ columns: 'one' })).toContain('grid-cols-1')
    expect(radioCardGroupGapVariants({ columns: 'one' })).not.toContain('@min-[32rem]:grid-cols-2')
  })

  it('uses a responsive three-column grid when columns is three', () => {
    expect(radioCardGroupGapVariants({ columns: 'three' })).toContain('grid-cols-1')
    expect(radioCardGroupGapVariants({ columns: 'three' })).toContain('@min-[32rem]:grid-cols-2')
    expect(radioCardGroupGapVariants({ columns: 'three' })).toContain('@min-[48rem]:grid-cols-3')
  })
})
