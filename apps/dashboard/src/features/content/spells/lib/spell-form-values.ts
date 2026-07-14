import {
  areaGeometrySchema,
  areaGeometryShapeSchema,
  type AreaGeometry,
  type AreaGeometryShape,
  spellCastingTimeSchema,
  spellComponentsSchema,
  spellDurationSchema,
  spellRangeSchema,
  spellTagsSchema,
  createSpellInputSchema,
  spellDeliveryMethodSchema,
  type CreateSpellInput,
  type Distance,
  type Spell,
  type SpellCastingTime,
  type SpellComponents,
  type SpellDuration,
  type SpellRange,
  type SpellTags,
} from '@rpg/contracts'

import { finalizeContentInput, slugForInputParse } from '../../lib/forms/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/content-form-registry'
import { SPELL_AREA_GEOMETRY_NONE, SPELL_DELIVERY_METHOD_NONE } from './spell-form-labels'
import type { SpellFormValues } from './spell-form-fields'
import { spellEffectsToFormValues } from './effects/effect-form-values'
import { resolutionToForm } from '../resolution/lib/form/resolution-form-values'

export type SpellFormCastingTime = {
  normal: {
    value: number
    unit: SpellCastingTime['normal']['unit']
    trigger?: string
  }
  canBeCastAsRitual: boolean
}

export type SpellFormRange = {
  kind: SpellRange['kind']
  value?: { value: number }
  description?: string
}

export type SpellFormDuration = {
  kind: SpellDuration['kind']
  value?: number
  unit?: Extract<SpellDuration, { kind: 'timed' }>['unit']
  concentration?: boolean
  upTo?: boolean
  description?: string
}

export type SpellFormComponents = {
  verbal?: boolean
  somatic?: boolean
  material?: { enabled?: boolean; description?: string }
}

export type SpellFormTags = {
  roles?: NonNullable<SpellTags['roles']>
  functions?: NonNullable<SpellTags['functions']>
  damageTypes?: NonNullable<SpellTags['damageTypes']>
  conditions?: NonNullable<SpellTags['conditions']>
}

export type SpellFormDistance = {
  value: number
  unit?: Distance['unit']
}

export type SpellFormAreaOfEffect = {
  shape: string
  radius?: SpellFormDistance
  length?: SpellFormDistance
  width?: SpellFormDistance
  size?: SpellFormDistance
  height?: SpellFormDistance
  description?: string
}

export const EMPTY_SPELL_AREA_OF_EFFECT: SpellFormAreaOfEffect = {
  shape: SPELL_AREA_GEOMETRY_NONE,
}

export const EMPTY_SPELL_TAGS: SpellFormTags = {
  roles: [],
  functions: [],
  damageTypes: [],
  conditions: [],
}

/** Create defaults intentionally omit `resolution` — authors enable via Add resolution. */
export const spellCreateDefaultValues: Partial<SpellFormValues> = {
  classIds: [],
  tags: { ...EMPTY_SPELL_TAGS },
  castingTime: {
    normal: { value: 1, unit: 'action' },
    canBeCastAsRitual: false,
  },
  range: { kind: 'self' },
  duration: { kind: 'instantaneous', value: 1, unit: 'round' },
  components: { verbal: true, somatic: true, material: { enabled: false } },
  areaOfEffect: { ...EMPTY_SPELL_AREA_OF_EFFECT },
  deliveryMethod: SPELL_DELIVERY_METHOD_NONE,
  effects: [],
}

export function spellCastingTimeToFormValues(castingTime: SpellCastingTime): SpellFormCastingTime {
  return {
    normal: {
      value: castingTime.normal.value,
      unit: castingTime.normal.unit,
      ...(castingTime.normal.trigger !== undefined && { trigger: castingTime.normal.trigger }),
    },
    canBeCastAsRitual: castingTime.canBeCastAsRitual,
  }
}

export function spellCastingTimeFromFormValues(
  castingTime: SpellFormCastingTime,
): SpellCastingTime {
  const { value, unit, trigger } = castingTime.normal
  return spellCastingTimeSchema.parse({
    normal: {
      value,
      unit,
      ...(unit === 'reaction' && trigger?.trim() ? { trigger: trigger.trim() } : {}),
    },
    canBeCastAsRitual: castingTime.canBeCastAsRitual,
  })
}

export function spellRangeToFormValues(range: SpellRange): SpellFormRange {
  switch (range.kind) {
    case 'distance':
      return { kind: range.kind, value: { value: range.value.value } }
    case 'special':
      return { kind: range.kind, description: range.description }
    default:
      return { kind: range.kind }
  }
}

export function spellRangeFromFormValues(range: SpellFormRange): SpellRange {
  switch (range.kind) {
    case 'distance':
      return spellRangeSchema.parse({
        kind: 'distance',
        value: { value: range.value?.value ?? 0, unit: 'ft' },
      })
    case 'special':
      return spellRangeSchema.parse({
        kind: 'special',
        description: range.description?.trim() ?? '',
      })
    default:
      return spellRangeSchema.parse({ kind: range.kind })
  }
}

export function spellDurationToFormValues(duration: SpellDuration): SpellFormDuration {
  switch (duration.kind) {
    case 'timed':
      return {
        kind: duration.kind,
        value: duration.value,
        unit: duration.unit,
        concentration: duration.concentration === true,
        upTo: duration.upTo === true,
      }
    case 'special':
      return { kind: duration.kind, description: duration.description }
    default:
      return { kind: duration.kind }
  }
}

export function spellDurationFromFormValues(duration: SpellFormDuration): SpellDuration {
  switch (duration.kind) {
    case 'timed': {
      const base = {
        kind: 'timed' as const,
        value: duration.value ?? 1,
        unit: duration.unit ?? 'round',
      }
      if (duration.concentration) {
        return spellDurationSchema.parse({
          ...base,
          concentration: true as const,
          ...(duration.upTo ? { upTo: true as const } : {}),
        })
      }
      if (duration.upTo) {
        return spellDurationSchema.parse({ ...base, upTo: true as const })
      }
      return spellDurationSchema.parse(base)
    }
    case 'special':
      return spellDurationSchema.parse({
        kind: 'special',
        description: duration.description?.trim() ?? '',
      })
    default:
      return spellDurationSchema.parse({ kind: 'instantaneous' })
  }
}

export function spellComponentsToFormValues(components: SpellComponents): SpellFormComponents {
  return {
    verbal: components.verbal === true,
    somatic: components.somatic === true,
    material: {
      enabled: components.material !== undefined,
      ...(components.material !== undefined && {
        description: components.material.description,
      }),
    },
  }
}

export function spellComponentsFromFormValues(components: SpellFormComponents): SpellComponents {
  const parsed: SpellComponents = {}
  if (components.verbal) parsed.verbal = true
  if (components.somatic) parsed.somatic = true
  if (components.material?.enabled) {
    const materialDescription = components.material.description?.trim()
    if (materialDescription) {
      parsed.material = { description: materialDescription }
    }
  }
  return spellComponentsSchema.parse(parsed)
}

export function spellTagsToFormValues(tags: Spell['tags']): SpellFormTags {
  if (!tags) return { ...EMPTY_SPELL_TAGS }
  return {
    roles: tags.roles ?? [],
    functions: tags.functions ?? [],
    damageTypes: tags.damageTypes ?? [],
    conditions: tags.conditions ?? [],
  }
}

export function spellTagsFromFormValues(tags: SpellFormTags | undefined): SpellTags | undefined {
  if (!tags) return undefined

  const result: SpellTags = {}
  if (tags.roles?.length) result.roles = tags.roles
  if (tags.functions?.length) result.functions = tags.functions
  if (tags.damageTypes?.length) result.damageTypes = tags.damageTypes
  if (tags.conditions?.length) result.conditions = tags.conditions

  if (Object.keys(result).length === 0) return undefined
  return spellTagsSchema.parse(result)
}

function toPositiveDistance(distance: SpellFormDistance | undefined): Distance {
  return { value: distance?.value ?? 0, unit: 'ft' }
}

function sphereAreaToFormValues(
  area: Extract<AreaGeometry, { shape: 'sphere' | 'emanation' }>,
): SpellFormAreaOfEffect {
  return {
    shape: area.shape,
    radius: { value: area.radius.value, unit: area.radius.unit },
  }
}

function coneAreaToFormValues(
  area: Extract<AreaGeometry, { shape: 'cone' }>,
): SpellFormAreaOfEffect {
  return {
    shape: area.shape,
    length: { value: area.length.value, unit: area.length.unit },
  }
}

function cubeAreaToFormValues(
  area: Extract<AreaGeometry, { shape: 'cube' }>,
): SpellFormAreaOfEffect {
  return {
    shape: area.shape,
    size: { value: area.size.value, unit: area.size.unit },
  }
}

function lineAreaToFormValues(
  area: Extract<AreaGeometry, { shape: 'line' }>,
): SpellFormAreaOfEffect {
  return {
    shape: area.shape,
    length: { value: area.length.value, unit: area.length.unit },
    width: { value: area.width.value, unit: area.width.unit },
  }
}

function cylinderAreaToFormValues(
  area: Extract<AreaGeometry, { shape: 'cylinder' }>,
): SpellFormAreaOfEffect {
  return {
    shape: area.shape,
    radius: { value: area.radius.value, unit: area.radius.unit },
    height: { value: area.height.value, unit: area.height.unit },
  }
}

function specialAreaToFormValues(
  area: Extract<AreaGeometry, { shape: 'special' }>,
): SpellFormAreaOfEffect {
  return {
    shape: area.shape,
    description: area.description,
  }
}

const AREA_GEOMETRY_TO_FORM_VALUES: Record<
  AreaGeometryShape,
  (area: AreaGeometry) => SpellFormAreaOfEffect
> = {
  sphere: (area) => sphereAreaToFormValues(area as Extract<AreaGeometry, { shape: 'sphere' }>),
  emanation: (area) =>
    sphereAreaToFormValues(area as Extract<AreaGeometry, { shape: 'emanation' }>),
  cone: (area) => coneAreaToFormValues(area as Extract<AreaGeometry, { shape: 'cone' }>),
  cube: (area) => cubeAreaToFormValues(area as Extract<AreaGeometry, { shape: 'cube' }>),
  line: (area) => lineAreaToFormValues(area as Extract<AreaGeometry, { shape: 'line' }>),
  cylinder: (area) =>
    cylinderAreaToFormValues(area as Extract<AreaGeometry, { shape: 'cylinder' }>),
  special: (area) => specialAreaToFormValues(area as Extract<AreaGeometry, { shape: 'special' }>),
}

const AREA_GEOMETRY_FROM_FORM_VALUES: Record<
  AreaGeometryShape,
  (area: SpellFormAreaOfEffect) => AreaGeometry
> = {
  sphere: (area) =>
    areaGeometrySchema.parse({
      shape: 'sphere',
      radius: toPositiveDistance(area.radius),
    }),
  emanation: (area) =>
    areaGeometrySchema.parse({
      shape: 'emanation',
      radius: toPositiveDistance(area.radius),
    }),
  cone: (area) =>
    areaGeometrySchema.parse({
      shape: 'cone',
      length: toPositiveDistance(area.length),
    }),
  cube: (area) =>
    areaGeometrySchema.parse({
      shape: 'cube',
      size: toPositiveDistance(area.size),
    }),
  line: (area) =>
    areaGeometrySchema.parse({
      shape: 'line',
      length: toPositiveDistance(area.length),
      width: toPositiveDistance(area.width),
    }),
  cylinder: (area) =>
    areaGeometrySchema.parse({
      shape: 'cylinder',
      radius: toPositiveDistance(area.radius),
      height: toPositiveDistance(area.height),
    }),
  special: (area) =>
    areaGeometrySchema.parse({
      shape: 'special',
      description: area.description?.trim() ?? '',
    }),
}

export function spellAreaOfEffectToFormValues(
  areaOfEffect: Spell['areaOfEffect'],
): SpellFormAreaOfEffect {
  if (!areaOfEffect) return { ...EMPTY_SPELL_AREA_OF_EFFECT }
  return AREA_GEOMETRY_TO_FORM_VALUES[areaOfEffect.shape](areaOfEffect)
}

export function spellAreaOfEffectFromFormValues(
  areaOfEffect: SpellFormAreaOfEffect | undefined,
): AreaGeometry | undefined {
  if (!areaOfEffect?.shape || areaOfEffect.shape === SPELL_AREA_GEOMETRY_NONE) {
    return undefined
  }

  const shape = areaGeometryShapeSchema.parse(areaOfEffect.shape)
  return AREA_GEOMETRY_FROM_FORM_VALUES[shape](areaOfEffect)
}

export function spellToFormValues(entity: Spell): SpellFormValues {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    cantripScaling: entity.cantripScaling,
    higherLevelSlotEffect: entity.higherLevelSlotEffect,
    school: entity.school,
    level: entity.level,
    classIds: entity.classIds,
    castingTime: spellCastingTimeToFormValues(entity.castingTime),
    range: spellRangeToFormValues(entity.range),
    duration: spellDurationToFormValues(entity.duration),
    components: spellComponentsToFormValues(entity.components),
    tags: spellTagsToFormValues(entity.tags),
    areaOfEffect: spellAreaOfEffectToFormValues(entity.areaOfEffect),
    deliveryMethod: entity.deliveryMethod ?? SPELL_DELIVERY_METHOD_NONE,
    effects: spellEffectsToFormValues(entity.effects),
    ...(entity.resolution
      ? (() => {
          const resolution = resolutionToForm(entity.resolution)
          return resolution ? { resolution } : {}
        })()
      : {}),
  }
}

export function buildSpellCreateInput(
  values: SpellFormValues,
  ctx?: ContentFormInputCtx<Spell>,
): CreateSpellInput {
  // TODO(spell.effect.persistence):
  // Include effects after the atomic-effect model and authoring UX are validated.
  // TODO(spell.resolution.persistence):
  // Include resolution after the resolution model and authoring UX are validated.
  const { effects: _effects, resolution: _resolution, ...persistedValues } = values

  const rawDelivery = persistedValues.deliveryMethod?.trim()
  const deliveryMethod =
    rawDelivery && rawDelivery !== SPELL_DELIVERY_METHOD_NONE
      ? spellDeliveryMethodSchema.parse(rawDelivery)
      : undefined

  const areaOfEffect = spellAreaOfEffectFromFormValues(
    persistedValues.areaOfEffect as SpellFormAreaOfEffect | undefined,
  )

  const input = createSpellInputSchema.parse({
    slug: slugForInputParse(persistedValues.name, ctx),
    name: persistedValues.name,
    description: persistedValues.description || undefined,
    cantripScaling: persistedValues.cantripScaling || undefined,
    higherLevelSlotEffect: persistedValues.higherLevelSlotEffect || undefined,
    school: persistedValues.school,
    level: persistedValues.level,
    classIds: persistedValues.classIds,
    castingTime: spellCastingTimeFromFormValues(
      persistedValues.castingTime as SpellFormCastingTime,
    ),
    range: spellRangeFromFormValues(persistedValues.range as SpellFormRange),
    duration: spellDurationFromFormValues(persistedValues.duration as SpellFormDuration),
    components: spellComponentsFromFormValues(persistedValues.components as SpellFormComponents),
    tags: spellTagsFromFormValues(persistedValues.tags),
    ...(areaOfEffect !== undefined && { areaOfEffect }),
    ...(deliveryMethod !== undefined && { deliveryMethod }),
  })

  return finalizeContentInput(input, ctx) as CreateSpellInput
}
