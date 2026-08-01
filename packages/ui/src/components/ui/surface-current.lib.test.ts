import { describe, expect, it } from 'vitest'

import {
  SURFACE_CURRENT_PLANES,
  establishSurfaceCurrent,
  portalPopoverSurfaceClasses,
} from './surface-current.lib'

describe('establishSurfaceCurrent', () => {
  it.each(SURFACE_CURRENT_PLANES)('binds plane %s to its CSS var', (plane) => {
    expect(establishSurfaceCurrent(plane)).toBe(`[--surface-current:var(--${plane})]`)
  })

  it('exports portal popover establish classes', () => {
    expect(portalPopoverSurfaceClasses).toBe('[--surface-current:var(--popover)]')
  })
})
