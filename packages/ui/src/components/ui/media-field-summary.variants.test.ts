import { describe, expect, it } from 'vitest'

import {
  mediaSummaryCompactActionVariants,
  mediaSummaryCompactButtonVariants,
  mediaSummaryWellVariants,
} from './media-field-summary.variants'

describe('mediaSummaryCompactButtonVariants', () => {
  it('keeps hover and focus chrome off the parent control', () => {
    const classes = mediaSummaryCompactButtonVariants()
    expect(classes).toContain('group')
    expect(classes).toContain('cursor-pointer')
    expect(classes).not.toContain('hover:bg-muted')
    expect(classes).not.toContain('focus-visible:ring-2')
  })
})

describe('mediaSummaryWellVariants', () => {
  it('localizes compact hover and focus treatment to the preview surface', () => {
    const classes = mediaSummaryWellVariants({ layout: 'compact' })
    expect(classes).toContain('group-hover:border-ring/50')
    expect(classes).toContain('group-hover:bg-accent')
    expect(classes).toContain('group-focus-visible:ring-2')
  })
})

describe('mediaSummaryCompactActionVariants', () => {
  it('underlines the action on group hover and focus', () => {
    const classes = mediaSummaryCompactActionVariants()
    expect(classes).toContain('group-hover:underline')
    expect(classes).toContain('group-focus-visible:underline')
  })
})
