import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { DEFAULT_DEPENDENT_CHROME } from '../../form/field-config/form-item.types'
import type { FieldConfig } from '../../form/field-config'
import {
  DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS,
  DEPENDENT_NEST_ALIGN_INLINE_SWITCH_CLASS,
  dependentNestPaddingClasses,
  dependentSectionStackVariants,
  resolveDependentNestRailClasses,
  resolveDependentNestShellClasses,
  resolveDependentPresentation,
  resolveDependentSectionStackClasses,
} from './field-dependent.variants'
import { resolveFieldRailClasses } from './field-rail.variants'

const cssDir = dirname(fileURLToPath(import.meta.url))
const dependentNestCss = readFileSync(join(cssDir, 'field-dependent.css'), 'utf8')

describe('resolveFieldRailClasses', () => {
  it('positions a group rail without content padding', () => {
    const classes = resolveFieldRailClasses()
    expect(classes).toContain('ui-field-rail')
    expect(classes).toContain('ui-border--default')
    expect(classes).toContain('ui-field-rail--tone-neutral')
    expect(classes).not.toContain('pl-9')
    expect(classes).not.toContain('border-l-2')
  })
})

describe('resolveDependentNestRailClasses', () => {
  it('uses a weaker flush-start rail for default dependent nests', () => {
    const classes = resolveDependentNestRailClasses()
    expect(classes).toContain('ui-field-rail-nest')
    expect(classes).toContain('ui-border--subtle')
  })
})

describe('dependent nest alignment CSS', () => {
  it('ties inline modifiers to choice-control theme variables', () => {
    expect(dependentNestCss).toContain('var(--control-choice-switch-width)')
    expect(dependentNestCss).toContain('var(--control-choice-indicator-size-sm)')
    expect(dependentNestCss).toContain('var(--spacing)')
  })
})

describe('resolveDependentPresentation', () => {
  const switchController: FieldConfig = {
    type: 'switch',
    name: 'enabled',
    label: 'Enable',
  }

  const selectController: FieldConfig = {
    type: 'select',
    name: 'mode',
    label: 'Mode',
    options: [{ label: 'A', value: 'a' }],
  }

  it('defaults omitted chrome to the dependent nest with switch alignment', () => {
    const presentation = resolveDependentPresentation({}, 'comfortable', {
      controller: switchController,
    })
    expect(presentation.chrome).toBe(DEFAULT_DEPENDENT_CHROME)
    expect(presentation.showNest).toBe(true)
    expect(presentation.railClassName).toContain('ui-field-rail-nest')
    expect(presentation.nestShellClassName).toContain(DEPENDENT_NEST_ALIGN_INLINE_SWITCH_CLASS)
    expect(presentation.nestShellClassName).not.toContain('ml-11')
  })

  it('uses field-edge alignment for stacked select controllers', () => {
    const presentation = resolveDependentPresentation({}, 'comfortable', {
      controller: selectController,
    })
    expect(presentation.nestShellClassName).toContain(DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS)
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
    const presentation = resolveDependentPresentation({ chrome: 'panel' }, 'comfortable', {
      controller: switchController,
    })
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
})

describe('dependent section stack rhythm', () => {
  it('maps compact and comfortable parent-child gaps', () => {
    expect(resolveDependentSectionStackClasses('compact')).toContain('gap-1')
    expect(resolveDependentSectionStackClasses('comfortable')).toContain('gap-2')
    expect(dependentSectionStackVariants({ rhythm: 'compact' })).toContain('gap-1')
  })
})
