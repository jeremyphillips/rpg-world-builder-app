import { describe, expect, it } from 'vitest'

import {
  COLOR_TOKEN_GROUPS,
  ON_SURFACE_TOKENS,
  PALETTE_ELEVATION_LADDER_TOKENS,
  SURFACE_BACKGROUNDS,
} from './color-palette.lib'

describe('color-palette.lib', () => {
  it('defines unique css variables across groups', () => {
    const vars = COLOR_TOKEN_GROUPS.flatMap((group) => group.tokens.map((token) => token.cssVar))
    expect(new Set(vars).size).toBe(vars.length)
  })

  it('includes core surface backgrounds for on-surface matrices', () => {
    expect(SURFACE_BACKGROUNDS.map((surface) => surface.cssVar)).toEqual(
      expect.arrayContaining(['--background', '--sunken', '--card', '--surface-muted']),
    )
  })

  it('keeps on-surface tokens non-empty', () => {
    expect(ON_SURFACE_TOKENS.length).toBeGreaterThan(10)
  })

  it('includes sidebar in surface backgrounds for on-surface matrices', () => {
    expect(SURFACE_BACKGROUNDS.map((surface) => surface.cssVar)).toContain('--sidebar')
  })

  it('defines an elevation ladder for palette surface roles', () => {
    expect(PALETTE_ELEVATION_LADDER_TOKENS.map((token) => token.name)).toEqual([
      'surface-base',
      'surface-subtle',
      'surface-muted',
      'surface-strong',
      'surface-panel',
      'surface-sunken',
    ])
  })
})
