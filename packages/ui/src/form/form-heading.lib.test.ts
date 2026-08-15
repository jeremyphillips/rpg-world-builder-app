import { describe, expect, it } from 'vitest'

import {
  resolveArrayLegendPresentation,
  resolveFieldLabelVisibility,
  resolveGroupHeadingTier,
  resolveGroupLegendSize,
  resolveNamedGroupDepthAfterEntering,
} from './form-heading.lib'

describe('resolveGroupHeadingTier', () => {
  it('returns section at depth 0', () => {
    expect(resolveGroupHeadingTier(0)).toBe('section')
  })

  it('returns subsection at depth 1 and beyond', () => {
    expect(resolveGroupHeadingTier(1)).toBe('subsection')
    expect(resolveGroupHeadingTier(2)).toBe('subsection')
  })
})

describe('resolveNamedGroupDepthAfterEntering', () => {
  it('increments depth only for named headings', () => {
    expect(resolveNamedGroupDepthAfterEntering(true, 0)).toBe(1)
    expect(resolveNamedGroupDepthAfterEntering(false, 0)).toBe(0)
    expect(resolveNamedGroupDepthAfterEntering(false, 1)).toBe(1)
  })
})

describe('resolveFieldLabelVisibility', () => {
  it('prefers explicit labelVisibility', () => {
    expect(resolveFieldLabelVisibility({ labelVisibility: 'srOnly' })).toBe('srOnly')
    expect(resolveFieldLabelVisibility({ labelVisibility: 'visible' })).toBe('visible')
  })

  it('defaults to visible', () => {
    expect(resolveFieldLabelVisibility({})).toBe('visible')
  })
})

describe('resolveArrayLegendPresentation', () => {
  it('uses array anatomy at top level with density scale', () => {
    expect(resolveArrayLegendPresentation(0, 'md')).toEqual({
      legendSize: 'array',
      legendScale: 'default',
    })
    expect(resolveArrayLegendPresentation(0, 'sm')).toEqual({
      legendSize: 'array',
      legendScale: 'sm',
    })
  })

  it('uses subsection typography when nested under a named group', () => {
    expect(resolveArrayLegendPresentation(1, 'md')).toEqual({
      legendSize: 'subsection',
      legendScale: 'default',
    })
  })
})

describe('resolveGroupLegendSize', () => {
  it('maps structural tiers to legend size tokens', () => {
    expect(resolveGroupLegendSize('section')).toBe('section')
    expect(resolveGroupLegendSize('subsection')).toBe('subsection')
  })
})
