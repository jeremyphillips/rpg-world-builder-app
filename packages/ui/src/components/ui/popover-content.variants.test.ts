import { describe, expect, it } from 'vitest'

import { menuItemClasses, popoverContentVariants } from './popover-content.variants'

describe('popoverContentVariants', () => {
  it('emits a tone class for each overlay host', () => {
    expect(popoverContentVariants({ tone: 'menu' })).toContain('ui-popover-content--menu')
    expect(popoverContentVariants({ tone: 'tooltip' })).toContain('ui-popover-content--tooltip')
    expect(popoverContentVariants({ tone: 'filter' })).toContain('ui-popover-content--filter')
    expect(popoverContentVariants()).toContain('ui-popover-content--popover')
  })

  it('exports the menu item class', () => {
    expect(menuItemClasses).toBe('ui-menu-item')
  })
})
