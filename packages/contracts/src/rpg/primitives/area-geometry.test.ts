import { describe, expect, it } from 'vitest'

import { getTermCompactLabel } from '../vocab/types'

import {
  AREA_GEOMETRY_SHAPE_ENTRIES,
  AREA_GEOMETRY_SHAPES,
  areaGeometrySchema,
  areaGeometryShapeSchema,
  getAreaGeometryShapeCompactLabel,
  getAreaGeometryShapeLabel,
  formatAreaGeometry,
} from './area-geometry'

describe('areaGeometryShapeSchema', () => {
  it('accepts every known shape', () => {
    for (const shape of AREA_GEOMETRY_SHAPES) {
      expect(areaGeometryShapeSchema.parse(shape)).toBe(shape)
    }
  })

  it('rejects unknown shapes', () => {
    expect(areaGeometryShapeSchema.safeParse('hexagon').success).toBe(false)
  })
})

describe('area geometry vocabulary', () => {
  it('defines labels and compact labels for every shape', () => {
    for (const shape of AREA_GEOMETRY_SHAPES) {
      const entry = AREA_GEOMETRY_SHAPE_ENTRIES[shape]
      expect(entry.label.length).toBeGreaterThan(0)
      expect(entry.description.length).toBeGreaterThan(0)
      expect(getAreaGeometryShapeLabel(shape)).toBe(entry.label)
      expect(getAreaGeometryShapeCompactLabel(shape)).toBe(getTermCompactLabel(entry))
    }
  })
})

describe('areaGeometrySchema', () => {
  it('parses each shape with required dimensions', () => {
    expect(
      areaGeometrySchema.parse({ shape: 'sphere', radius: { value: 20, unit: 'ft' } }),
    ).toEqual({ shape: 'sphere', radius: { value: 20, unit: 'ft' } })
    expect(
      areaGeometrySchema.parse({ shape: 'emanation', radius: { value: 30, unit: 'ft' } }),
    ).toEqual({ shape: 'emanation', radius: { value: 30, unit: 'ft' } })
    expect(areaGeometrySchema.parse({ shape: 'cone', length: { value: 15, unit: 'ft' } })).toEqual({
      shape: 'cone',
      length: { value: 15, unit: 'ft' },
    })
    expect(areaGeometrySchema.parse({ shape: 'cube', size: { value: 15, unit: 'ft' } })).toEqual({
      shape: 'cube',
      size: { value: 15, unit: 'ft' },
    })
    expect(
      areaGeometrySchema.parse({
        shape: 'line',
        length: { value: 30, unit: 'ft' },
        width: { value: 5, unit: 'ft' },
      }),
    ).toEqual({
      shape: 'line',
      length: { value: 30, unit: 'ft' },
      width: { value: 5, unit: 'ft' },
    })
    expect(
      areaGeometrySchema.parse({
        shape: 'cylinder',
        radius: { value: 10, unit: 'ft' },
        height: { value: 20, unit: 'ft' },
      }),
    ).toEqual({
      shape: 'cylinder',
      radius: { value: 10, unit: 'ft' },
      height: { value: 20, unit: 'ft' },
    })
    expect(
      areaGeometrySchema.parse({ shape: 'special', description: 'A 10-foot wall segment.' }),
    ).toEqual({ shape: 'special', description: 'A 10-foot wall segment.' })
  })

  it('rejects missing radius on sphere', () => {
    expect(areaGeometrySchema.safeParse({ shape: 'sphere' }).success).toBe(false)
  })

  it('rejects extra radius on cone', () => {
    expect(
      areaGeometrySchema.safeParse({
        shape: 'cone',
        length: { value: 15, unit: 'ft' },
        radius: { value: 15, unit: 'ft' },
      }).success,
    ).toBe(false)
  })

  it('rejects missing width on line', () => {
    expect(
      areaGeometrySchema.safeParse({
        shape: 'line',
        length: { value: 30, unit: 'ft' },
      }).success,
    ).toBe(false)
  })

  it('rejects whitespace-only special description', () => {
    expect(areaGeometrySchema.safeParse({ shape: 'special', description: '   ' }).success).toBe(
      false,
    )
  })

  it('rejects unknown shape', () => {
    expect(
      areaGeometrySchema.safeParse({
        shape: 'hexagon',
        radius: { value: 10, unit: 'ft' },
      }).success,
    ).toBe(false)
  })

  it('rejects zero or negative dimensions', () => {
    expect(
      areaGeometrySchema.safeParse({ shape: 'sphere', radius: { value: 0, unit: 'ft' } }).success,
    ).toBe(false)
    expect(
      areaGeometrySchema.safeParse({ shape: 'cone', length: { value: -5, unit: 'ft' } }).success,
    ).toBe(false)
  })
})

describe('formatAreaGeometry', () => {
  it('formats each shape with canonical compact strings', () => {
    expect(formatAreaGeometry({ shape: 'sphere', radius: { value: 20, unit: 'ft' } })).toBe(
      '20-ft-radius sphere',
    )
    expect(formatAreaGeometry({ shape: 'cone', length: { value: 15, unit: 'ft' } })).toBe(
      '15-ft cone',
    )
    expect(
      formatAreaGeometry({
        shape: 'line',
        length: { value: 30, unit: 'ft' },
        width: { value: 5, unit: 'ft' },
      }),
    ).toBe('30-ft-long, 5-ft-wide line')
    expect(
      formatAreaGeometry({
        shape: 'cylinder',
        radius: { value: 10, unit: 'ft' },
        height: { value: 20, unit: 'ft' },
      }),
    ).toBe('10-ft-radius, 20-ft-high cylinder')
    expect(formatAreaGeometry({ shape: 'emanation', radius: { value: 10, unit: 'ft' } })).toBe(
      '10-ft emanation',
    )
    expect(formatAreaGeometry({ shape: 'cube', size: { value: 20, unit: 'ft' } })).toBe(
      '20-ft cube',
    )
    expect(formatAreaGeometry({ shape: 'special', description: 'A 10-foot wall segment.' })).toBe(
      'A 10-foot wall segment.',
    )
  })

  it('formats fractional positive distances', () => {
    expect(formatAreaGeometry({ shape: 'cone', length: { value: 2.5, unit: 'ft' } })).toBe(
      '2½-ft cone',
    )
  })
})
