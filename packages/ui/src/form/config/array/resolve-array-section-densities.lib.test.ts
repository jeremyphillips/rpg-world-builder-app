import { describe, expect, it } from 'vitest'

import type { ArrayConfig } from '../../field-config'
import { resolveArraySectionDensities } from './resolve-array-section-densities.lib'

const baseArray: ArrayConfig = {
  kind: 'array',
  name: 'tiers',
  heading: { label: 'Tiers' },
  fields: [{ type: 'text', name: 'label', label: 'Label' }],
}

describe('resolveArraySectionDensities', () => {
  it('inherits presentation and sets compact control default when density is omitted', () => {
    const resolved = resolveArraySectionDensities(baseArray, { density: 'comfortable' })

    expect(resolved.presentationDensity).toBe('comfortable')
    expect(resolved.bodyLayoutDensity).toBe('compact')
    expect(resolved.defaultControlSize).toBe('sm')
    expect(resolved.legendFieldSize).toBe('md')
    expect(resolved.legendRhythm).toBe('comfortable')
  })

  it('aligns presentation, body, and control when density is explicit', () => {
    const resolved = resolveArraySectionDensities(
      { ...baseArray, density: 'comfortable' },
      { density: 'compact' },
    )

    expect(resolved.presentationDensity).toBe('comfortable')
    expect(resolved.bodyLayoutDensity).toBe('comfortable')
    expect(resolved.defaultControlSize).toBeUndefined()
    expect(resolved.legendFieldSize).toBe('md')
  })

  it('clears inherited defaultControlSize when array density is explicit', () => {
    const resolved = resolveArraySectionDensities(
      { ...baseArray, density: 'compact' },
      { density: 'comfortable', defaultControlSize: 'sm' },
    )

    expect(resolved.defaultControlSize).toBeUndefined()
    expect(resolved.bodyLayoutDensity).toBe('compact')
  })
})
