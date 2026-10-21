import { describe, expect, it } from 'vitest'

import { resolveSurfaceActionButtonSize } from './surface-action-button-size.lib'

describe('resolveSurfaceActionButtonSize', () => {
  it('uses sm for compact and comfortable density', () => {
    expect(resolveSurfaceActionButtonSize('compact')).toBe('sm')
    expect(resolveSurfaceActionButtonSize('comfortable')).toBe('sm')
  })

  it('uses default (md tier) for spacious density', () => {
    expect(resolveSurfaceActionButtonSize('spacious')).toBe('default')
  })
})
