import { describe, expect, it } from 'vitest'

import type { ArrayConfig } from '../field-config'
import { DEFAULT_FORM_DENSITY } from '../form-density'
import { buildArraySectionChildContext } from './form-section-child-context.lib'

const baseArray: ArrayConfig = {
  kind: 'array',
  name: 'effects',
  heading: { label: 'On hit' },
  fields: [{ type: 'text', name: 'label', label: 'Label' }],
}

describe('buildArraySectionChildContext', () => {
  it('uses compact item density with comfortable section presentation when density is omitted', () => {
    const parent = {
      depth: 0,
      namedGroupDepth: 0,
      density: DEFAULT_FORM_DENSITY,
    }
    const child = buildArraySectionChildContext(parent, 0, baseArray)

    expect(child.density).toBe('compact')
    expect(child.arraySectionPresentationDensity).toBe('comfortable')
    expect(child.defaultControlSize).toBe('sm')
  })

  it('aligns item and section presentation when array density is explicit', () => {
    const parent = {
      depth: 0,
      namedGroupDepth: 0,
      density: 'comfortable' as const,
    }
    const child = buildArraySectionChildContext(parent, 0, { ...baseArray, density: 'comfortable' })

    expect(child.density).toBe('comfortable')
    expect(child.arraySectionPresentationDensity).toBe('comfortable')
    expect(child.defaultControlSize).toBeUndefined()
  })
})
