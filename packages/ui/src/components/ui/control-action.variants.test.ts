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
  controlActionXsCompactTextWithIconClasses,
  controlActionXsIconClasses,
  controlActionXsTextClasses,
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

  it('pairs compact text+icon with xs gap and sm glyph', () => {
    expect(controlActionCompactTextWithIconClasses).toContain('h-control-action-compact')
    expect(controlActionCompactTextWithIconClasses).toContain('gap-1')
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

  it('locks xs text control to 28px height and 10px type', () => {
    expect(controlActionXsTextClasses).toContain('h-control-action-xs')
    expect(controlActionXsTextClasses).toContain('text-control-action-xs')
    expect(controlActionXsTextClasses).toContain('gap-1')
    expect(controlActionXsTextClasses).toContain('[&_svg]:size-icon-glyph-xs')
  })

  it('locks xs compact text+icon to 24px height and xs glyph', () => {
    expect(controlActionXsCompactTextWithIconClasses).toContain('h-control-action-compact')
    expect(controlActionXsCompactTextWithIconClasses).toContain('text-control-action-xs')
    expect(controlActionXsCompactTextWithIconClasses).toContain('[&_svg]:size-icon-glyph-xs')
  })

  it('locks xs icon control to 24px hit target and xs glyph', () => {
    expect(controlActionXsIconClasses).toContain('size-control-action-compact')
    expect(controlActionXsIconClasses).toContain('[&_svg]:size-icon-glyph-xs')
    expect(controlActionXsIconClasses).not.toContain('[&_svg]:size-icon-glyph-md')
  })
})
