import { describe, expect, it } from 'vitest'

import {
  controlActionCompactHeightClasses,
  controlActionCompactIconClasses,
  controlActionCompactSizeClasses,
  controlActionCompactTextClasses,
  controlActionCompactTextWithIconClasses,
  controlActionDefaultIconClasses,
  controlActionDefaultSizeClasses,
  controlActionLgIconClasses,
  controlActionLgSizeClasses,
} from './control-action.variants'

describe('controlAction variants', () => {
  it('maps compact height and size to control-action tokens', () => {
    expect(controlActionCompactHeightClasses).toBe('h-control-action-compact')
    expect(controlActionCompactSizeClasses).toBe('size-control-action-compact')
    expect(controlActionCompactTextClasses).toBe('h-control-action-compact')
    expect(controlActionDefaultSizeClasses).toBe('size-control-action-default')
    expect(controlActionLgSizeClasses).toBe('size-control-action-lg')
  })

  it('locks compact icon pairing to 24px hit target and md (14px) glyph', () => {
    expect(controlActionCompactIconClasses).toContain('size-control-action-compact')
    expect(controlActionCompactIconClasses).toContain('[&_svg]:size-icon-glyph-md')
    expect(controlActionCompactIconClasses).not.toContain('size-icon-glyph-sm')
    expect(controlActionCompactIconClasses).not.toContain('size-icon-glyph-xs')
  })

  it('pairs compact text+icon with sm glyph', () => {
    expect(controlActionCompactTextWithIconClasses).toContain('h-control-action-compact')
    expect(controlActionCompactTextWithIconClasses).toContain('[&_svg]:size-icon-glyph-sm')
  })

  it('pairs default icon control with lg glyph', () => {
    expect(controlActionDefaultIconClasses).toContain('size-control-action-default')
    expect(controlActionDefaultIconClasses).toContain('[&_svg]:size-icon-glyph-lg')
  })

  it('pairs large icon control with 40px hit target and lg glyph', () => {
    expect(controlActionLgIconClasses).toContain('size-control-action-lg')
    expect(controlActionLgIconClasses).toContain('[&_svg]:size-icon-glyph-lg')
  })
})
