import { z } from 'zod'

import type { GameTermEntry } from '../vocab/types'
import { getTermCompactLabel } from '../vocab/types'

import { formatFractionalNumber } from './number-format'
import { type PositiveDistance, positiveDistanceSchema } from './units'

// ---------------------------------------------------------------------------
// Area geometry shapes — closed vocabulary for formatter grammar and form selects.
// ---------------------------------------------------------------------------

export const AREA_GEOMETRY_SHAPE_TERM = {
  label: 'Area Shape',
  description: 'The geometric form of a spell or effect area.',
  sentence: {
    singular: 'area shape',
    plural: 'area shapes',
  },
} as const satisfies GameTermEntry

export const AREA_GEOMETRY_SHAPE_ENTRIES = {
  sphere: {
    label: 'Sphere',
    compactLabel: 'sphere',
    description: 'A spherical area defined by its radius.',
  },
  emanation: {
    label: 'Emanation',
    compactLabel: 'emanation',
    description: 'An area that radiates outward from an origin point.',
  },
  cone: {
    label: 'Cone',
    compactLabel: 'cone',
    description: 'A conical area defined by its length from the point of origin.',
  },
  cube: {
    label: 'Cube',
    compactLabel: 'cube',
    description: 'A cubic area defined by the length of each side.',
  },
  line: {
    label: 'Line',
    compactLabel: 'line',
    description: 'A line-shaped area with length and width.',
  },
  cylinder: {
    label: 'Cylinder',
    compactLabel: 'cylinder',
    description: 'A cylindrical area defined by its radius and height.',
  },
  special: {
    label: 'Special',
    compactLabel: 'special',
    description: 'A non-standard area described in the rules text.',
  },
} as const satisfies Record<string, GameTermEntry>

export type AreaGeometryShape = keyof typeof AREA_GEOMETRY_SHAPE_ENTRIES

export const AREA_GEOMETRY_SHAPES = Object.keys(AREA_GEOMETRY_SHAPE_ENTRIES) as [
  AreaGeometryShape,
  ...AreaGeometryShape[],
]

export const areaGeometryShapeSchema = z.enum(AREA_GEOMETRY_SHAPES)

/** Returns the display label for an area geometry shape. Falls back to the raw value. */
export function getAreaGeometryShapeLabel(id: string): string {
  return AREA_GEOMETRY_SHAPE_ENTRIES[id as AreaGeometryShape]?.label ?? id
}

/** Returns the compact label for an area geometry shape. Falls back to the raw value. */
export function getAreaGeometryShapeCompactLabel(id: string): string {
  const entry = AREA_GEOMETRY_SHAPE_ENTRIES[id as AreaGeometryShape]
  return entry ? getTermCompactLabel(entry) : id
}

const areaGeometrySphereSchema = z
  .object({
    shape: z.literal('sphere'),
    /** Radius of the sphere. */
    radius: positiveDistanceSchema,
  })
  .strict()

const areaGeometryEmanationSchema = z
  .object({
    shape: z.literal('emanation'),
    /** Radius of the emanation. */
    radius: positiveDistanceSchema,
  })
  .strict()

const areaGeometryConeSchema = z
  .object({
    shape: z.literal('cone'),
    /** Distance from the cone's point of origin to its far edge. */
    length: positiveDistanceSchema,
  })
  .strict()

const areaGeometryCubeSchema = z
  .object({
    shape: z.literal('cube'),
    /** Length of each side of the cube. */
    size: positiveDistanceSchema,
  })
  .strict()

const areaGeometryLineSchema = z
  .object({
    shape: z.literal('line'),
    /** Length along the line. */
    length: positiveDistanceSchema,
    /** Width perpendicular to the line. */
    width: positiveDistanceSchema,
  })
  .strict()

const areaGeometryCylinderSchema = z
  .object({
    shape: z.literal('cylinder'),
    /** Radius of the circular base. */
    radius: positiveDistanceSchema,
    /** Height of the cylinder. */
    height: positiveDistanceSchema,
  })
  .strict()

const areaGeometrySpecialSchema = z
  .object({
    shape: z.literal('special'),
    description: z.string().trim().min(1),
  })
  .strict()

/**
 * Models only the geometry and dimensions of an area.
 *
 * Area origin is intentionally not modeled yet. Future mechanics may need to
 * distinguish areas originating from the caster, a target, an object, or a
 * chosen point within range, as well as whether the area moves with its origin.
 *
 * Keep range and area geometry separate so origin semantics can be added later
 * without reshaping authored area data.
 *
 * TODO(spell.effect.area-origin): Model area origin and movement semantics.
 */
export const areaGeometrySchema = z.discriminatedUnion('shape', [
  areaGeometrySphereSchema,
  areaGeometryEmanationSchema,
  areaGeometryConeSchema,
  areaGeometryCubeSchema,
  areaGeometryLineSchema,
  areaGeometryCylinderSchema,
  areaGeometrySpecialSchema,
])

export type AreaGeometry = z.infer<typeof areaGeometrySchema>

function formatPositiveDistanceFeet(distance: PositiveDistance): string {
  return `${formatFractionalNumber(distance.value)}-ft`
}

function formatPositiveDistanceFeetWithSuffix(distance: PositiveDistance, suffix: string): string {
  return `${formatFractionalNumber(distance.value)}-ft-${suffix}`
}

/** Compact display string for area geometry (e.g. "20-ft-radius sphere"). Does not include range. */
export function formatAreaGeometry(area: AreaGeometry): string {
  const shapeLabel = getAreaGeometryShapeCompactLabel(area.shape)

  switch (area.shape) {
    case 'sphere':
      return `${formatPositiveDistanceFeetWithSuffix(area.radius, 'radius')} ${shapeLabel}`
    case 'emanation':
      return `${formatPositiveDistanceFeet(area.radius)} ${shapeLabel}`
    case 'cone':
      return `${formatPositiveDistanceFeet(area.length)} ${shapeLabel}`
    case 'cube':
      return `${formatPositiveDistanceFeet(area.size)} ${shapeLabel}`
    case 'line':
      return `${formatPositiveDistanceFeetWithSuffix(area.length, 'long')}, ${formatPositiveDistanceFeetWithSuffix(area.width, 'wide')} ${shapeLabel}`
    case 'cylinder':
      return `${formatPositiveDistanceFeetWithSuffix(area.radius, 'radius')}, ${formatPositiveDistanceFeetWithSuffix(area.height, 'high')} ${shapeLabel}`
    case 'special':
      return area.description
  }
}
