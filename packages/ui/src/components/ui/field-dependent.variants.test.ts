import { describe, expect, it } from 'vitest'

import { fieldRailInnerPaddingClasses, fieldToggleDependentIndentClasses } from './field.variants'
import {
  resolveDependentLayoutClasses,
  resolveDependentPresentation,
  resolveDependentRailChromeClasses,
} from './field-dependent.variants'

describe('resolveDependentLayoutClasses', () => {
  it('maps inset to controller-relative outer offset', () => {
    expect(resolveDependentLayoutClasses('inset')).toBe(fieldToggleDependentIndentClasses)
  })

  it('maps flush to no outer offset', () => {
    expect(resolveDependentLayoutClasses('flush')).toBe('')
  })
})

describe('resolveDependentRailChromeClasses', () => {
  it('applies border-left and small local inner padding only', () => {
    const classes = resolveDependentRailChromeClasses()
    expect(classes).toContain('border-l-2')
    expect(classes).toContain(fieldRailInnerPaddingClasses)
    expect(classes).not.toContain('pl-11')
  })
})

describe('resolveDependentPresentation', () => {
  it.each([
    {
      label: 'inset + none',
      config: { layout: 'inset' as const, chrome: 'none' as const },
      layoutClass: fieldToggleDependentIndentClasses,
      hasRail: false,
    },
    {
      label: 'inset + rail',
      config: { layout: 'inset' as const, chrome: 'rail' as const },
      layoutClass: fieldToggleDependentIndentClasses,
      hasRail: true,
    },
    {
      label: 'flush + none',
      config: { layout: 'flush' as const, chrome: 'none' as const },
      layoutClass: '',
      hasRail: false,
    },
    {
      label: 'flush + rail',
      config: { layout: 'flush' as const, chrome: 'rail' as const },
      layoutClass: '',
      hasRail: true,
    },
  ])('$label composes layout and chrome independently', ({ config, layoutClass, hasRail }) => {
    const presentation = resolveDependentPresentation({ fields: [], ...config }, 'comfortable')
    expect(presentation.layoutClassName).toBe(layoutClass)
    if (hasRail) {
      expect(presentation.chromeWrapperClassName).toContain('border-l-2')
      expect(presentation.chromeWrapperClassName).toContain(fieldRailInnerPaddingClasses)
    } else {
      expect(presentation.chromeWrapperClassName).toBeUndefined()
    }
  })
})
