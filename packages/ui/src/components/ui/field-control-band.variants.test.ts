import { describe, expect, it } from 'vitest'

import { fieldControlBandVariants } from './field-control-band.variants'
import type { FieldSizeToken } from './field-sizing.variants'

const SIZES: FieldSizeToken[] = ['xs', 'sm', 'md', 'lg']

const SIZE_MIN_HEIGHTS: Record<FieldSizeToken, string> = {
  xs: 'min-h-6',
  sm: 'min-h-8',
  md: 'min-h-9',
  lg: 'min-h-11',
}

describe('fieldControlBandVariants', () => {
  it.each(SIZES)('single-line %s applies one size min-height and centers', (size) => {
    const className = fieldControlBandVariants({ size, band: 'single-line' })
    expect(className).toContain(SIZE_MIN_HEIGHTS[size])
    expect(className).toContain('items-center')
    expect(className).not.toContain('min-h-0')
    expect(className).not.toContain('items-start')
    for (const other of SIZES) {
      if (other === size) continue
      expect(className).not.toContain(SIZE_MIN_HEIGHTS[other])
    }
  })

  it.each(SIZES)('content-sized %s emits no size min-height', (size) => {
    const className = fieldControlBandVariants({ size, band: 'content-sized' })
    expect(className).toContain('min-h-0')
    expect(className).toContain('h-auto')
    expect(className).toContain('items-start')
    expect(className).not.toContain('items-center')
    for (const token of Object.values(SIZE_MIN_HEIGHTS)) {
      expect(className).not.toContain(token)
    }
  })
})
