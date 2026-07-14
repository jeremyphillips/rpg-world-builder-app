import { describe, expect, it } from 'vitest'

import { COLOR_TOKEN_GROUPS, ON_SURFACE_TOKENS, SURFACE_BACKGROUNDS } from './color-palette.lib'

describe('color-palette.lib', () => {
  it('defines unique css variables across groups', () => {
    const vars = COLOR_TOKEN_GROUPS.flatMap((group) => group.tokens.map((token) => token.cssVar))
    expect(new Set(vars).size).toBe(vars.length)
  })

  it('includes core surface backgrounds for on-surface matrices', () => {
    expect(SURFACE_BACKGROUNDS.map((surface) => surface.cssVar)).toEqual(
      expect.arrayContaining(['--background', '--card', '--muted']),
    )
  })

  it('keeps on-surface tokens non-empty', () => {
    expect(ON_SURFACE_TOKENS.length).toBeGreaterThan(10)
  })
})
