import { describe, expect, it } from 'vitest'

import { resolveFormSectionHeaderPresentation } from './resolve-form-section-header-presentation.lib'

describe('resolveFormSectionHeaderPresentation', () => {
  it('honors explicit rhythm and size overrides', () => {
    expect(
      resolveFormSectionHeaderPresentation({
        rhythm: 'compact',
        size: 'sm',
        density: 'comfortable',
        inheritedDensity: 'compact',
      }),
    ).toEqual({ rhythm: 'compact', size: 'sm' })
  })

  it('resolves rhythm and size from an explicit density prop', () => {
    expect(resolveFormSectionHeaderPresentation({ density: 'compact' })).toEqual({
      rhythm: 'compact',
      size: 'sm',
    })
  })

  it('inherits parent density when density prop is omitted', () => {
    expect(resolveFormSectionHeaderPresentation({ inheritedDensity: 'compact' })).toEqual({
      rhythm: 'compact',
      size: 'sm',
    })
  })

  it('falls back to default form density', () => {
    expect(resolveFormSectionHeaderPresentation({})).toEqual({
      rhythm: 'comfortable',
      size: 'md',
    })
  })
})
