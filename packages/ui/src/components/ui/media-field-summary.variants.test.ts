import { describe, expect, it } from 'vitest'

import {
  mediaSummaryCompactGearButtonVariants,
  mediaSummaryCompactInteractiveRootVariants,
  mediaSummaryCompactOverlayVariants,
  mediaSummaryCompactPreviewButtonVariants,
  mediaSummaryWellVariants,
} from './media-field-summary.variants'

describe('mediaSummaryCompactInteractiveRootVariants', () => {
  it('keeps the compact preview in a fixed square hover group container', () => {
    const classes = mediaSummaryCompactInteractiveRootVariants()
    expect(classes).toContain('group')
    expect(classes).toContain('relative')
    expect(classes).toContain('block')
    expect(classes).toContain('size-30')
    expect(classes).toContain('overflow-hidden')
  })
})

describe('mediaSummaryWellVariants', () => {
  it('localizes compact hover and focus treatment to the preview surface', () => {
    const classes = mediaSummaryWellVariants({ layout: 'compact' })
    expect(classes).toContain('group-hover:border-ring/50')
    expect(classes).toContain('group-hover:bg-accent')
    expect(classes).toContain('group-focus-within:ring-2')
  })
})

describe('mediaSummaryCompactPreviewButtonVariants', () => {
  it('exposes focus ring chrome and pointer cursor on the preview control', () => {
    const classes = mediaSummaryCompactPreviewButtonVariants()
    expect(classes).toContain('focus-visible:ring-2')
    expect(classes).toContain('enabled:cursor-pointer')
  })
})

describe('mediaSummaryCompactOverlayVariants', () => {
  it('anchors count copy over a translucent sunken bar', () => {
    const classes = mediaSummaryCompactOverlayVariants()
    expect(classes).toContain('absolute')
    expect(classes).toContain('bottom-px')
    expect(classes).toContain('inset-x-px')
    expect(classes).toContain('h-5')
    expect(classes).toContain('items-center')
    expect(classes).toContain('bg-sunken/80')
  })
})

describe('mediaSummaryCompactGearButtonVariants', () => {
  it('exposes focus ring chrome and trailing inset on the manage control', () => {
    const classes = mediaSummaryCompactGearButtonVariants()
    expect(classes).toContain('absolute')
    expect(classes).toContain('bottom-px')
    expect(classes).toContain('right-px')
    expect(classes).toContain('h-5')
    expect(classes).toContain('focus-visible:ring-2')
    expect(classes).toContain('enabled:cursor-pointer')
    expect(classes).toContain('items-center')
    expect(classes).toContain('pr-0.5')
  })
})
