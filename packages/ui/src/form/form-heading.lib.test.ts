import { describe, expect, it } from 'vitest'

import {
  resolveArrayLegendPresentation,
  resolveArrayLegendPresentationWithLegacyOverride,
  resolveFieldLabelVisibility,
  resolveGroupHeadingTier,
  resolveGroupLegendSizeWithLegacyOverride,
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
    expect(resolveFieldLabelVisibility({ labelVisibility: 'srOnly', labelHidden: false })).toBe(
      'srOnly',
    )
    expect(resolveFieldLabelVisibility({ labelVisibility: 'visible', hideLabel: true })).toBe(
      'visible',
    )
  })

  it('maps deprecated hideLabel and labelHidden to srOnly', () => {
    expect(resolveFieldLabelVisibility({ hideLabel: true })).toBe('srOnly')
    expect(resolveFieldLabelVisibility({ labelHidden: true })).toBe('srOnly')
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

describe('resolveGroupLegendSizeWithLegacyOverride', () => {
  it('honors explicit legendSize during migration', () => {
    expect(resolveGroupLegendSizeWithLegacyOverride('section', 'subsection')).toBe('subsection')
  })

  it('falls back to structural tier when override omitted', () => {
    expect(resolveGroupLegendSizeWithLegacyOverride('subsection')).toBe('subsection')
  })
})

describe('resolveArrayLegendPresentationWithLegacyOverride', () => {
  it('honors non-array legacy legendSize during migration', () => {
    expect(resolveArrayLegendPresentationWithLegacyOverride(0, 'md', 'section')).toEqual({
      legendSize: 'section',
      legendScale: 'default',
    })
  })

  it('derives structurally when legacy override is array or omitted', () => {
    expect(resolveArrayLegendPresentationWithLegacyOverride(0, 'sm', 'array')).toEqual({
      legendSize: 'array',
      legendScale: 'sm',
    })
  })
})
