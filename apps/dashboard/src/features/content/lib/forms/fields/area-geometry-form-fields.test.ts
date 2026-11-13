import type { FormItem, SelectFieldConfig } from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import {
  AREA_GEOMETRY_FORM_NONE,
  AREA_GEOMETRY_SHAPE_PLACEHOLDER,
  areaGeometryFormFields,
  areaGeometryShapeOptions,
  resolveAreaGeometryShapeOptions,
} from './area-geometry-form-fields'

function findShapeSelect(items: FormItem[]): SelectFieldConfig | undefined {
  for (const item of items) {
    if ('kind' in item && item.kind === 'group' && item.fields) {
      const found = findShapeSelect(item.fields as FormItem[])
      if (found) return found
    }
    if ('kind' in item && item.kind === 'row' && item.fields) {
      const found = findShapeSelect(item.fields as FormItem[])
      if (found) return found
    }
    if ('type' in item && item.type === 'select' && item.name.endsWith('.shape')) {
      return item
    }
  }
  return undefined
}

describe('resolveAreaGeometryShapeOptions', () => {
  it('includes None by default for spell-style consumers', () => {
    const options = resolveAreaGeometryShapeOptions()
    expect(options[0]).toEqual({ value: AREA_GEOMETRY_FORM_NONE, label: 'None' })
    expect(options.some((option) => option.value === 'special')).toBe(true)
    expect(areaGeometryShapeOptions[0]?.value).toBe(AREA_GEOMETRY_FORM_NONE)
  })

  it('omits None when configured for required monster save areas', () => {
    const options = resolveAreaGeometryShapeOptions({ includeExplicitNoneOption: false })
    expect(options.some((option) => option.value === AREA_GEOMETRY_FORM_NONE)).toBe(false)
    expect(options.some((option) => option.value === 'cone')).toBe(true)
    expect(options.some((option) => option.value === 'special')).toBe(true)
  })
})

describe('areaGeometryFormFields', () => {
  const base = {
    fieldPrefix: 'resolution.areaOfEffect',
    legend: 'Area',
    shapeHint: 'Hint',
  }

  it('keeps spell defaults with an explicit None option', () => {
    const shape = findShapeSelect(areaGeometryFormFields(base))
    expect(shape?.options?.[0]?.value).toBe(AREA_GEOMETRY_FORM_NONE)
    expect(shape).not.toHaveProperty('placeholder')
    expect(shape?.required).toBeUndefined()
  })

  it('uses placeholder and required Shape when None is omitted', () => {
    const shape = findShapeSelect(
      areaGeometryFormFields({
        ...base,
        includeExplicitNoneOption: false,
      }),
    )
    expect(shape?.options?.some((option) => option.value === AREA_GEOMETRY_FORM_NONE)).toBe(false)
    expect(shape?.placeholder).toBe(AREA_GEOMETRY_SHAPE_PLACEHOLDER)
    expect(shape?.required).toBe(true)
  })

  it('still gates dimension fields on concrete shapes', () => {
    const fields = areaGeometryFormFields({
      ...base,
      includeExplicitNoneOption: false,
    })
    const names = JSON.stringify(fields)
    expect(names).toContain('resolution.areaOfEffect.radius')
    expect(names).toContain('resolution.areaOfEffect.description')
  })
})

// Re-import guard: contracts export must not gain a persisted `none` shape.
describe('AREA_GEOMETRY_FORM_NONE sentinel', () => {
  it('stays a form-only string, not a contract vocabulary id', () => {
    expect(AREA_GEOMETRY_FORM_NONE).toBe('none')
  })
})
