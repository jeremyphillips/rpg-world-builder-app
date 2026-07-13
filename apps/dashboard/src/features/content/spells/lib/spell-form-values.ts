import {
  spellCastingTimeSchema,
  spellComponentsSchema,
  spellDurationSchema,
  spellRangeSchema,
  spellTagsSchema,
  createSpellInputSchema,
  spellDeliveryMethodSchema,
  type CreateSpellInput,
  type Spell,
  type SpellCastingTime,
  type SpellComponents,
  type SpellDuration,
  type SpellRange,
  type SpellTags,
} from '@rpg/contracts'

import { finalizeContentInput, slugForInputParse } from '../../lib/forms/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/content-form-registry'
import { SPELL_DELIVERY_METHOD_NONE } from './spell-form-labels'
import type { SpellFormValues } from './spell-form-fields'

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

export const EMPTY_SPELL_TAGS: SpellFormTags = {
  roles: [],
  functions: [],
  damageTypes: [],
  conditions: [],
}

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
  deliveryMethod: SPELL_DELIVERY_METHOD_NONE,
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
    deliveryMethod: entity.deliveryMethod ?? SPELL_DELIVERY_METHOD_NONE,
  }
}

export function buildSpellCreateInput(
  values: SpellFormValues,
  ctx?: ContentFormInputCtx<Spell>,
): CreateSpellInput {
  const rawDelivery = values.deliveryMethod?.trim()
  const deliveryMethod =
    rawDelivery && rawDelivery !== SPELL_DELIVERY_METHOD_NONE
      ? spellDeliveryMethodSchema.parse(rawDelivery)
      : undefined

  const input = createSpellInputSchema.parse({
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    cantripScaling: values.cantripScaling || undefined,
    higherLevelSlotEffect: values.higherLevelSlotEffect || undefined,
    school: values.school,
    level: values.level,
    classIds: values.classIds,
    castingTime: spellCastingTimeFromFormValues(values.castingTime as SpellFormCastingTime),
    range: spellRangeFromFormValues(values.range as SpellFormRange),
    duration: spellDurationFromFormValues(values.duration as SpellFormDuration),
    components: spellComponentsFromFormValues(values.components as SpellFormComponents),
    tags: spellTagsFromFormValues(values.tags),
    ...(deliveryMethod !== undefined && { deliveryMethod }),
  })

  return finalizeContentInput(input, ctx) as CreateSpellInput
}
