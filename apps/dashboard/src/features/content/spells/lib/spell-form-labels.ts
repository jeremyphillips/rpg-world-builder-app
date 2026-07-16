import {
  AREA_GEOMETRY_SHAPES,
  AREA_GEOMETRY_SHAPE_ENTRIES,
  CASTING_TIME_UNITS,
  CASTING_TIME_UNIT_ENTRIES,
  DURATION_UNITS,
  DURATION_UNIT_ENTRIES,
  EFFECT_CONDITION_ENTRIES,
  EFFECT_CONDITION_IDS,
  formatSpellLevel,
  MAX_SPELL_CONTENT_LEVEL,
  MIN_SPELL_CONTENT_LEVEL,
  SPELL_DELIVERY_METHODS,
  SPELL_DELIVERY_METHOD_ENTRIES,
  SPELL_FUNCTION_TAG_ENTRIES,
  SPELL_FUNCTION_TAGS,
  SPELL_RANGE_KINDS,
  SPELL_RANGE_KIND_ENTRIES,
  SPELL_ROLE_TAG_ENTRIES,
  SPELL_ROLE_TAGS,
} from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

import { CANTRIP_LEVEL_LABEL } from './format-spell-metadata'

export const SPELL_DURATION_KINDS = ['instantaneous', 'timed', 'special'] as const

export const SPELL_DURATION_KIND_LABELS: Record<(typeof SPELL_DURATION_KINDS)[number], string> = {
  instantaneous: 'Instantaneous',
  timed: 'Timed',
  special: 'Special',
}

export const SPELL_DELIVERY_METHOD_NONE = 'none'

export const SPELL_AREA_GEOMETRY_NONE = 'none'

export const areaGeometryShapeOptions: FieldOption[] = [
  { value: SPELL_AREA_GEOMETRY_NONE, label: 'None' },
  ...toOptions(
    AREA_GEOMETRY_SHAPES,
    Object.fromEntries(
      AREA_GEOMETRY_SHAPES.map((shape) => [shape, AREA_GEOMETRY_SHAPE_ENTRIES[shape].label]),
    ) as Record<(typeof AREA_GEOMETRY_SHAPES)[number], string>,
  ),
]

export const spellLevelOptions: FieldOption[] = Array.from(
  { length: MAX_SPELL_CONTENT_LEVEL - MIN_SPELL_CONTENT_LEVEL + 1 },
  (_, index) => {
    const level = MIN_SPELL_CONTENT_LEVEL + index
    return {
      value: String(level),
      label: level === 0 ? CANTRIP_LEVEL_LABEL : formatSpellLevel(level),
    }
  },
)

export const castingTimeUnitOptions = toOptions(
  CASTING_TIME_UNITS,
  Object.fromEntries(
    CASTING_TIME_UNITS.map((u) => [u, CASTING_TIME_UNIT_ENTRIES[u].label]),
  ) as Record<(typeof CASTING_TIME_UNITS)[number], string>,
)

export const rangeKindOptions = toOptions(
  SPELL_RANGE_KINDS,
  Object.fromEntries(
    SPELL_RANGE_KINDS.map((k) => [k, SPELL_RANGE_KIND_ENTRIES[k].label]),
  ) as Record<(typeof SPELL_RANGE_KINDS)[number], string>,
)

export const durationKindOptions = toOptions(SPELL_DURATION_KINDS, SPELL_DURATION_KIND_LABELS)

export const durationUnitOptions = toOptions(
  DURATION_UNITS,
  Object.fromEntries(DURATION_UNITS.map((u) => [u, DURATION_UNIT_ENTRIES[u].label])) as Record<
    (typeof DURATION_UNITS)[number],
    string
  >,
)

export const deliveryMethodOptions: FieldOption[] = [
  { value: SPELL_DELIVERY_METHOD_NONE, label: 'None' },
  ...toOptions(
    SPELL_DELIVERY_METHODS,
    Object.fromEntries(
      SPELL_DELIVERY_METHODS.map((m) => [m, SPELL_DELIVERY_METHOD_ENTRIES[m].label]),
    ) as Record<(typeof SPELL_DELIVERY_METHODS)[number], string>,
  ),
]

export const roleTagOptions = toOptions(
  SPELL_ROLE_TAGS,
  Object.fromEntries(SPELL_ROLE_TAGS.map((t) => [t, SPELL_ROLE_TAG_ENTRIES[t].label])) as Record<
    (typeof SPELL_ROLE_TAGS)[number],
    string
  >,
)

export const functionTagOptions = toOptions(
  SPELL_FUNCTION_TAGS,
  Object.fromEntries(
    SPELL_FUNCTION_TAGS.map((t) => [t, SPELL_FUNCTION_TAG_ENTRIES[t].label]),
  ) as Record<(typeof SPELL_FUNCTION_TAGS)[number], string>,
)

export const conditionTagOptions = toOptions(
  EFFECT_CONDITION_IDS,
  Object.fromEntries(
    EFFECT_CONDITION_IDS.map((c) => [c, EFFECT_CONDITION_ENTRIES[c].label]),
  ) as Record<(typeof EFFECT_CONDITION_IDS)[number], string>,
)
