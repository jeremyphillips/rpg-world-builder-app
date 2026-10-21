import { describe, expect, it } from 'vitest'

import { TEXT_VARIANT_CATALOG } from './text.styles'
import { TEXT_VARIANT_MAP, TEXT_VARIANTS, textVariants } from './text.variants'

describe('text variant catalog', () => {
  it('lists every Text variant from the CVA map', () => {
    expect(Object.keys(TEXT_VARIANT_CATALOG).sort()).toEqual([...TEXT_VARIANTS].sort())
    expect([...TEXT_VARIANTS].sort()).toEqual(Object.keys(TEXT_VARIANT_MAP).sort())
  })

  it('maps each variant to its text-style utility', () => {
    for (const variant of TEXT_VARIANTS) {
      expect(textVariants({ variant })).toBe(TEXT_VARIANT_MAP[variant])
    }
  })
})
