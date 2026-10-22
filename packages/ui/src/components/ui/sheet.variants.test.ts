import { describe, expect, it } from 'vitest'

import { sheetContentVariants } from './sheet.variants'

describe('sheetContentVariants', () => {
  it('uses one physical opposite-edge stroke for directional sides', () => {
    expect(sheetContentVariants({ side: 'right' })).toContain('ui-dialog-panel--side-right')
    expect(sheetContentVariants({ side: 'left' })).toContain('ui-dialog-panel--side-left')
    expect(sheetContentVariants({ side: 'bottom' })).toContain('ui-dialog-panel--side-bottom')
    expect(sheetContentVariants({ side: 'right' })).not.toMatch(/\bborder-r\b/)
    expect(sheetContentVariants({ side: 'left' })).not.toMatch(/\bborder-l\b/)
  })

  it('establishes the card plane for surface-relative chrome by default', () => {
    expect(sheetContentVariants()).toContain('ui-dialog-panel--fill-card')
    expect(sheetContentVariants()).toContain('ui-border--default')
  })

  it('supports background surface and large application width', () => {
    expect(sheetContentVariants({ surface: 'background' })).toContain(
      'ui-dialog-panel--fill-background',
    )
    expect(sheetContentVariants({ size: 'lg' })).toContain('max-w-[550px]')
  })

  it('supports field-container surface', () => {
    expect(sheetContentVariants({ surface: 'field-container' })).toContain(
      'ui-dialog-panel--fill-field-container',
    )
  })

  it('slides with the enter animation only', () => {
    const classes = sheetContentVariants()
    expect(classes).toContain('data-[state=open]:duration-200')
    expect(classes).toContain('data-[state=closed]:duration-150')
    expect(classes).toContain('data-[state=open]:animate-in')
    expect(classes).not.toContain('transition')
    expect(classes).not.toContain('duration-500')
  })

  it('supports surface-lift for application drawers', () => {
    expect(sheetContentVariants({ surface: 'surface-lift' })).toContain(
      'ui-dialog-panel--fill-surface-lift',
    )
  })
})
