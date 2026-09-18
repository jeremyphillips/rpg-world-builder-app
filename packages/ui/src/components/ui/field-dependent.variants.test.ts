import { describe, expect, it } from 'vitest'

import { DEFAULT_DEPENDENT_CHROME } from '../../form/field-config'
import {
  dependentNestMarginClasses,
  dependentSectionStackClasses,
  dependentNestPaddingClasses,
  resolveDependentNestRailClasses,
  resolveDependentNestShellClasses,
  resolveDependentPresentation,
} from './field-dependent.variants'
import { fieldRailOffsetClasses, resolveFieldRailClasses } from './field-rail.variants'

describe('resolveFieldRailClasses', () => {
  it('positions a group rail without content padding', () => {
    const classes = resolveFieldRailClasses()
    expect(classes).toContain('relative')
    expect(classes).toContain('before:left-2')
    expect(classes).toContain(fieldRailOffsetClasses)
    expect(classes).not.toContain('pl-9')
    expect(classes).not.toContain('border-l-2')
  })
})

describe('resolveDependentNestRailClasses', () => {
  it('uses a weaker flush-left rail for default dependent nests', () => {
    const classes = resolveDependentNestRailClasses()
    expect(classes).toContain('before:left-0')
    expect(classes).toContain('before:w-px')
    expect(classes).toContain('before:bg-border-faint')
  })
})

describe('resolveDependentPresentation', () => {
  it('defaults omitted chrome to the dependent nest', () => {
    const presentation = resolveDependentPresentation({}, 'comfortable')
    expect(presentation.chrome).toBe(DEFAULT_DEPENDENT_CHROME)
    expect(presentation.showNest).toBe(true)
    expect(presentation.railClassName).toContain('before:left-0')
    expect(presentation.nestShellClassName).toContain(dependentNestMarginClasses)
  })

  it('opts out of nest chrome when chrome is none', () => {
    const presentation = resolveDependentPresentation({ chrome: 'none' }, 'comfortable')
    expect(presentation.showNest).toBe(false)
    expect(presentation.railClassName).toBeUndefined()
    expect(presentation.nestShellClassName).toBeUndefined()
  })

  it('maps legacy inset false to flush layout', () => {
    const presentation = resolveDependentPresentation(
      { inset: false, chrome: 'rail' },
      'comfortable',
    )
    expect(presentation.chrome).toBe('none')
    expect(presentation.showNest).toBe(false)
  })

  it('maps legacy panel chrome to the dependent nest', () => {
    const presentation = resolveDependentPresentation({ chrome: 'panel' }, 'comfortable')
    expect(presentation.showNest).toBe(true)
    expect(presentation.nestShellClassName).toContain(dependentNestPaddingClasses)
    expect(presentation.nestShellClassName).not.toContain('border')
  })

  it('uses background fill on field-container hosts', () => {
    expect(resolveDependentNestShellClasses('field-container')).toContain('bg-background')
  })

  it('uses faint fill on array-item hosts', () => {
    expect(resolveDependentNestShellClasses('array-item')).toContain('bg-surface-faint')
  })

  it('exposes 16px stack rhythm between controller and dependents', () => {
    expect(dependentSectionStackClasses).toContain('gap-4')
  })
})
