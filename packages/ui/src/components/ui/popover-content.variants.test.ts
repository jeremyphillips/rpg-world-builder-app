import { describe, expect, it } from 'vitest'

import {
  overlayArrowHeight,
  overlayArrowPath,
  overlayArrowWidth,
  popoverContentVariants,
} from './popover-content.variants'

describe('popoverContentVariants', () => {
  it('emits a tone class for each overlay host', () => {
    expect(popoverContentVariants({ tone: 'menu' })).toContain('ui-popover-content--menu')
    expect(popoverContentVariants({ tone: 'tooltip' })).toContain('ui-popover-content--tooltip')
    expect(popoverContentVariants({ tone: 'filter' })).toContain('ui-popover-content--filter')
    expect(popoverContentVariants()).toContain('ui-popover-content--popover')
    expect(popoverContentVariants()).toContain('ui-border--default')
  })
})

describe('overlay arrow defaults', () => {
  it('uses an inset open path inside a larger pointer box', () => {
    expect(overlayArrowWidth).toBe(20)
    expect(overlayArrowHeight).toBe(10)
    expect(overlayArrowPath).toBe('M2.61 2.5 L10 9.5 L17.39 2.5')
  })
})
