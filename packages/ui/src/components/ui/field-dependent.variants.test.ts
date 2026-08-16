import { describe, expect, it } from 'vitest'

import { DEFAULT_DEPENDENT_INSET } from '../../form/field-config'
import { fieldRailOffsetClasses, resolveFieldRailClasses } from './field-rail.variants'
import { resolveDependentInsetClasses, resolveFormInsetPaddingClasses } from './field.variants'
import { resolveDependentPresentation } from './field-dependent.variants'

describe('resolveDependentInsetClasses', () => {
  it('maps inset true to rhythm-derived content padding', () => {
    expect(resolveDependentInsetClasses(true, 'comfortable')).toBe('pl-9')
    expect(resolveDependentInsetClasses(true, 'compact')).toBe('pl-8')
  })

  it('maps inset false to no content offset', () => {
    expect(resolveDependentInsetClasses(false, 'comfortable')).toBe('')
  })
})

describe('resolveFieldRailClasses', () => {
  it('positions a pseudo rail without content padding', () => {
    const classes = resolveFieldRailClasses()
    expect(classes).toContain('relative')
    expect(classes).toContain('before:left-2')
    expect(classes).toContain(fieldRailOffsetClasses)
    expect(classes).not.toContain('pl-9')
    expect(classes).not.toContain('border-l-2')
  })
})

describe('resolveDependentPresentation', () => {
  it('applies content inset when inset is true', () => {
    const presentation = resolveDependentPresentation(
      { fields: [], inset: DEFAULT_DEPENDENT_INSET, chrome: 'none' },
      'comfortable',
    )
    expect(presentation.insetClassName).toBe('pl-9')
    expect(presentation.railClassName).toBeUndefined()
  })

  it('applies no content inset when inset is false', () => {
    const presentation = resolveDependentPresentation(
      { fields: [], inset: false, chrome: 'none' },
      'comfortable',
    )
    expect(presentation.insetClassName).toBe('')
  })

  it.each([
    {
      label: 'inset + none',
      config: { inset: true as const, chrome: 'none' as const },
      insetClass: 'pl-9',
      hasRail: false,
    },
    {
      label: 'inset + rail',
      config: { inset: true as const, chrome: 'rail' as const },
      insetClass: 'pl-9',
      hasRail: true,
    },
    {
      label: 'no inset + none',
      config: { inset: false as const, chrome: 'none' as const },
      insetClass: '',
      hasRail: false,
    },
    {
      label: 'no inset + rail',
      config: { inset: false as const, chrome: 'rail' as const },
      insetClass: '',
      hasRail: true,
    },
    {
      label: 'inset + panel',
      config: { inset: true as const, chrome: 'panel' as const },
      insetClass: 'pl-9',
      hasRail: false,
      hasPanel: true,
    },
    {
      label: 'no inset + panel',
      config: { inset: false as const, chrome: 'panel' as const },
      insetClass: '',
      hasRail: false,
      hasPanel: true,
    },
  ])(
    '$label composes inset and chrome independently',
    ({ config, insetClass, hasRail, hasPanel }) => {
      const presentation = resolveDependentPresentation({ fields: [], ...config }, 'comfortable')
      expect(presentation.insetClassName).toBe(insetClass)
      if (hasRail) {
        expect(presentation.railClassName).toContain('before:left-2')
        expect(presentation.railClassName).not.toContain('pl-9')
        expect(presentation.chromeWrapperClassName).toBeUndefined()
      } else if (hasPanel) {
        expect(presentation.chromeWrapperClassName).toContain('rounded-md')
        expect(presentation.railClassName).toBeUndefined()
      } else {
        expect(presentation.railClassName).toBeUndefined()
        expect(presentation.chromeWrapperClassName).toBeUndefined()
      }
    },
  )

  it('does not add rail padding on top of content inset', () => {
    const presentation = resolveDependentPresentation(
      { fields: [], inset: true, chrome: 'rail' },
      'comfortable',
    )
    expect(presentation.insetClassName).toBe('pl-9')
    expect(presentation.railClassName).not.toContain('pl-9')
    expect(presentation.railClassName).not.toContain('pl-8')
  })

  it('uses compact content inset with rail decoration', () => {
    const presentation = resolveDependentPresentation(
      { fields: [], inset: DEFAULT_DEPENDENT_INSET, chrome: 'rail' },
      'compact',
    )
    expect(presentation.insetClassName).toBe(resolveFormInsetPaddingClasses('compact', 'left'))
    expect(presentation.railClassName).toContain('before:left-2')
  })
})
