import { describe, expectTypeOf, it } from 'vitest'

import type { ContentCardDensity } from './content-card.variants'

describe('ContentCardDensity', () => {
  it('excludes spacious from the content-card density union', () => {
    expectTypeOf<'compact' | 'comfortable'>().toEqualTypeOf<ContentCardDensity>()
    expectTypeOf<'spacious'>().not.toEqualTypeOf<ContentCardDensity>()
  })
})
