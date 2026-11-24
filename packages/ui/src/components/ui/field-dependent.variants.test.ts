import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { DEFAULT_DEPENDENT_CHROME } from '../../form/field-config/form-item.types'
import type { FieldConfig } from '../../form/field-config'
import {
  DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS,
  DEPENDENT_NEST_ALIGN_INLINE_SWITCH_CLASS,
  DEPENDENT_NEST_HOST_CLASS,
  DEPENDENT_NEST_RHYTHM_CLASS,
} from './field-dependent-alignment.constants'
import {
  dependentSectionStackVariants,
  resolveDependentNestClasses,
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

describe('dependent nest alignment CSS', () => {
  it('ties inline modifiers to choice-control theme variables', () => {
    expect(dependentNestCss).toContain('var(--control-choice-switch-width)')
    expect(dependentNestCss).toContain('var(--control-choice-indicator-size-sm)')
    expect(dependentNestCss).toContain('var(--spacing)')
  })
})

describe('resolveDependentNestClasses', () => {
  it('includes the nest block and subtle border strength for the rail', () => {
    const classes = resolveDependentNestClasses({
      rhythm: 'comfortable',
      surfaceHost: 'field-container',
    })
    expect(classes).toContain('ui-field-dependent-nest')
    expect(classes).toContain('ui-border--subtle')
  })

  it('maps compact and comfortable rhythm modifiers', () => {
    const compact = resolveDependentNestClasses({
      rhythm: 'compact',
      surfaceHost: 'field-container',
    })
    expect(compact).toContain(DEPENDENT_NEST_RHYTHM_CLASS.compact)
    expect(compact).not.toContain(DEPENDENT_NEST_RHYTHM_CLASS.comfortable)

    const comfortable = resolveDependentNestClasses({
      rhythm: 'comfortable',
      surfaceHost: 'field-container',
    })
    expect(comfortable).toContain(DEPENDENT_NEST_RHYTHM_CLASS.comfortable)
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
    expect(presentation.nestClassName).toContain('ui-field-dependent-nest')
    expect(presentation.nestClassName).toContain('ui-border--subtle')
    expect(presentation.nestClassName).toContain(DEPENDENT_NEST_ALIGN_INLINE_SWITCH_CLASS)
    expect(presentation.nestClassName).toContain(DEPENDENT_NEST_RHYTHM_CLASS.comfortable)
    expect(presentation.nestClassName).not.toContain('ml-11')
  })

  it('uses compact rhythm on the nest when density is compact', () => {
    const presentation = resolveDependentPresentation({}, 'compact', {
      controller: switchController,
    })
    expect(presentation.nestClassName).toContain(DEPENDENT_NEST_RHYTHM_CLASS.compact)
    expect(presentation.nestClassName).not.toContain(DEPENDENT_NEST_RHYTHM_CLASS.comfortable)
  })

  it('uses field-edge alignment for stacked select controllers', () => {
    const presentation = resolveDependentPresentation({}, 'comfortable', {
      controller: selectController,
    })
    expect(presentation.nestClassName).toContain(DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS)
  })

  it('opts out of nest chrome when chrome is none', () => {
    const presentation = resolveDependentPresentation({ chrome: 'none' }, 'comfortable')
    expect(presentation.showNest).toBe(false)
    expect(presentation.nestClassName).toBeUndefined()
  })

  it('maps legacy panel chrome to the dependent nest', () => {
    const presentation = resolveDependentPresentation({ chrome: 'panel' }, 'comfortable', {
      controller: switchController,
    })
    expect(presentation.showNest).toBe(true)
    expect(presentation.nestClassName).toContain(DEPENDENT_NEST_RHYTHM_CLASS.comfortable)
    expect(presentation.nestClassName).not.toContain('rounded-md')
  })

  it('uses background host on field-container hosts', () => {
    expect(
      resolveDependentNestClasses({ rhythm: 'comfortable', surfaceHost: 'field-container' }),
    ).toContain(DEPENDENT_NEST_HOST_CLASS['field-container'])
  })

  it('uses faint host on array-item hosts', () => {
    expect(
      resolveDependentNestClasses({ rhythm: 'comfortable', surfaceHost: 'array-item' }),
    ).toContain(DEPENDENT_NEST_HOST_CLASS['array-item'])
  })
})

describe('dependent section stack rhythm', () => {
  it('maps compact and comfortable parent-child gaps', () => {
    expect(resolveDependentSectionStackClasses('compact')).toContain('gap-1')
    expect(resolveDependentSectionStackClasses('comfortable')).toContain('gap-2')
    expect(dependentSectionStackVariants({ rhythm: 'compact' })).toContain('gap-1')
  })
})
