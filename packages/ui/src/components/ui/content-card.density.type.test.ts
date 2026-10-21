import { describe, expectTypeOf, it } from 'vitest'

import type { ContentCardDensity } from './content-card.variants'

describe('ContentCardDensity', () => {
  it('includes spacious on the content-card density union', () => {
    expectTypeOf<'compact' | 'comfortable' | 'spacious'>().toEqualTypeOf<ContentCardDensity>()
  })
})
