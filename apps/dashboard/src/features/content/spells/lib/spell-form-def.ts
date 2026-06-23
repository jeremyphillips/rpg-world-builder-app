import { z } from 'zod'
import {
  CASTING_TIME_UNITS,
  CASTING_TIME_UNIT_ENTRIES,
  createSpellInputSchema,
  DAMAGE_TYPE_ENTRIES,
  DAMAGE_TYPE_IDS,
  DURATION_UNITS,
  DURATION_UNIT_ENTRIES,
  EFFECT_CONDITION_ENTRIES,
  EFFECT_CONDITION_IDS,
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
  SPELL_SCHOOLS,
  SPELL_SCHOOL_ENTRIES,
  castingTimeUnitSchema,
  damageTypeSchema,
  durationUnitSchema,
  effectConditionSchema,
  formatSpellLevel,
  slugSchema,
  spellContentLevelSchema,
  spellDeliveryMethodSchema,
  spellFunctionTagSchema,
  spellRangeKindSchema,
  spellRoleTagSchema,
  spellSchoolSchema,
  type CreateSpellInput,
  type Spell,
} from '@rpg/contracts'
import {
  toOptions,
  type FieldOption,
  type FieldVisibility,
  type FormItem,
  type TabbedFormTab,
} from '@rpg/ui/form'

import { identityFields } from '../../lib/content-form-field-helpers'
import {
  contentFormRegistry,
  contentFormFields,
  type ContentFormCtx,
  type ContentFormDef,
  type ContentFormInputCtx,
} from '../../lib/content-form-registry'
import { finalizeContentInput, slugForInputParse } from '../../lib/content-form-key-helpers'
import { useSpells, spellsQueryKey } from '../hooks/use-spells'
import { CANTRIP_LEVEL_LABEL } from './format-spell-metadata'
import {
  EMPTY_SPELL_TAGS,
  spellCastingTimeFromFormValues,
  spellCastingTimeToFormValues,
  spellComponentsFromFormValues,
  spellComponentsToFormValues,
  spellDurationFromFormValues,
  spellDurationToFormValues,
  spellRangeFromFormValues,
  spellRangeToFormValues,
  spellTagsFromFormValues,
  spellTagsToFormValues,
  type SpellFormCastingTime,
  type SpellFormComponents,
  type SpellFormDuration,
  type SpellFormRange,
} from './spell-form-field-helpers'

const SPELL_DURATION_KINDS = ['instantaneous', 'timed', 'special'] as const

const SPELL_DURATION_KIND_LABELS: Record<(typeof SPELL_DURATION_KINDS)[number], string> = {
  instantaneous: 'Instantaneous',
  timed: 'Timed',
  special: 'Special',
}

const SPELL_DELIVERY_METHOD_NONE = 'none'

const schoolOptions = toOptions(
  SPELL_SCHOOLS,
  Object.fromEntries(SPELL_SCHOOLS.map((s) => [s, SPELL_SCHOOL_ENTRIES[s].label])) as Record<
    (typeof SPELL_SCHOOLS)[number],
    string
  >,
)

const spellLevelOptions: FieldOption[] = Array.from(
  { length: MAX_SPELL_CONTENT_LEVEL - MIN_SPELL_CONTENT_LEVEL + 1 },
  (_, index) => {
    const level = MIN_SPELL_CONTENT_LEVEL + index
    return {
      value: String(level),
      label: level === 0 ? CANTRIP_LEVEL_LABEL : formatSpellLevel(level),
    }
  },
)

const castingTimeUnitOptions = toOptions(
  CASTING_TIME_UNITS,
  Object.fromEntries(
    CASTING_TIME_UNITS.map((u) => [u, CASTING_TIME_UNIT_ENTRIES[u].label]),
  ) as Record<(typeof CASTING_TIME_UNITS)[number], string>,
)

const rangeKindOptions = toOptions(
  SPELL_RANGE_KINDS,
  Object.fromEntries(
    SPELL_RANGE_KINDS.map((k) => [k, SPELL_RANGE_KIND_ENTRIES[k].label]),
  ) as Record<(typeof SPELL_RANGE_KINDS)[number], string>,
)

const durationKindOptions = toOptions(SPELL_DURATION_KINDS, SPELL_DURATION_KIND_LABELS)

const durationUnitOptions = toOptions(
  DURATION_UNITS,
  Object.fromEntries(DURATION_UNITS.map((u) => [u, DURATION_UNIT_ENTRIES[u].label])) as Record<
    (typeof DURATION_UNITS)[number],
    string
  >,
)

const deliveryMethodOptions: FieldOption[] = [
  { value: SPELL_DELIVERY_METHOD_NONE, label: 'None' },
  ...toOptions(
    SPELL_DELIVERY_METHODS,
    Object.fromEntries(
      SPELL_DELIVERY_METHODS.map((m) => [m, SPELL_DELIVERY_METHOD_ENTRIES[m].label]),
    ) as Record<(typeof SPELL_DELIVERY_METHODS)[number], string>,
  ),
]

const roleTagOptions = toOptions(
  SPELL_ROLE_TAGS,
  Object.fromEntries(SPELL_ROLE_TAGS.map((t) => [t, SPELL_ROLE_TAG_ENTRIES[t].label])) as Record<
    (typeof SPELL_ROLE_TAGS)[number],
    string
  >,
)

const functionTagOptions = toOptions(
  SPELL_FUNCTION_TAGS,
  Object.fromEntries(
    SPELL_FUNCTION_TAGS.map((t) => [t, SPELL_FUNCTION_TAG_ENTRIES[t].label]),
  ) as Record<(typeof SPELL_FUNCTION_TAGS)[number], string>,
)

const damageTypeOptions = toOptions(
  DAMAGE_TYPE_IDS,
  Object.fromEntries(DAMAGE_TYPE_IDS.map((d) => [d, DAMAGE_TYPE_ENTRIES[d].label])) as Record<
    (typeof DAMAGE_TYPE_IDS)[number],
    string
  >,
)

const conditionTagOptions = toOptions(
  EFFECT_CONDITION_IDS,
  Object.fromEntries(
    EFFECT_CONDITION_IDS.map((c) => [c, EFFECT_CONDITION_ENTRIES[c].label]),
  ) as Record<(typeof EFFECT_CONDITION_IDS)[number], string>,
)

function visibleWhenRangeDistance(): FieldVisibility {
  return {
    dependsOn: ['range.kind'],
    visibleWhen: (v) => v['range.kind'] === 'distance',
  }
}

function visibleWhenRangeSpecial(): FieldVisibility {
  return {
    dependsOn: ['range.kind'],
    visibleWhen: (v) => v['range.kind'] === 'special',
  }
}

function visibleWhenDurationTimed(): FieldVisibility {
  return {
    dependsOn: ['duration.kind'],
    visibleWhen: (v) => v['duration.kind'] === 'timed',
  }
}

function visibleWhenDurationSpecial(): FieldVisibility {
  return {
    dependsOn: ['duration.kind'],
    visibleWhen: (v) => v['duration.kind'] === 'special',
  }
}

function visibleWhenReactionCastingTime(): FieldVisibility {
  return {
    dependsOn: ['castingTime.normal.unit'],
    visibleWhen: (v) => v['castingTime.normal.unit'] === 'reaction',
  }
}

const spellFormSchema = z
  .object({
    name: z.string().min(1),
    slug: slugSchema.optional(),
    description: z.string().optional(),
    school: spellSchoolSchema,
    level: spellContentLevelSchema,
    classIds: z.array(z.string()).min(1),
    tags: z
      .object({
        roles: z.array(spellRoleTagSchema).optional(),
        functions: z.array(spellFunctionTagSchema).optional(),
        damageTypes: z.array(damageTypeSchema).optional(),
        conditions: z.array(effectConditionSchema).optional(),
      })
      .optional(),
    castingTime: z.object({
      normal: z.object({
        value: z.coerce.number().int().min(1),
        unit: castingTimeUnitSchema,
        trigger: z.string().optional(),
      }),
      canBeCastAsRitual: z.boolean(),
    }),
    range: z.object({
      kind: spellRangeKindSchema,
      value: z.object({ value: z.coerce.number().min(0) }).optional(),
      description: z.string().optional(),
    }),
    duration: z.object({
      kind: z.enum(SPELL_DURATION_KINDS),
      value: z.coerce.number().int().min(1).optional(),
      unit: durationUnitSchema.optional(),
      concentration: z.boolean().optional(),
      upTo: z.boolean().optional(),
      description: z.string().optional(),
    }),
    components: z.object({
      verbal: z.boolean().optional(),
      somatic: z.boolean().optional(),
      material: z.object({ description: z.string().optional() }).optional(),
    }),
    deliveryMethod: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const hasComponent =
      values.components.verbal === true ||
      values.components.somatic === true ||
      Boolean(values.components.material?.description?.trim())

    if (!hasComponent) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one spell component (verbal, somatic, or material) is required',
        path: ['components'],
      })
    }
  })

type SpellFormValues = z.infer<typeof spellFormSchema>

const spellCreateDefaultValues: Partial<SpellFormValues> = {
  level: 0,
  classIds: [],
  tags: { ...EMPTY_SPELL_TAGS },
  castingTime: {
    normal: { value: 1, unit: 'action' },
    canBeCastAsRitual: false,
  },
  range: { kind: 'self' },
  duration: { kind: 'instantaneous' },
  components: { verbal: true, somatic: true },
  deliveryMethod: SPELL_DELIVERY_METHOD_NONE,
}

function basicsFields(ctx: ContentFormCtx): FormItem[] {
  return [
    ...identityFields(),
    {
      kind: 'row',
      fields: [
        {
          type: 'select',
          name: 'school',
          label: 'School',
          options: schoolOptions,
          required: true,
        },
        {
          type: 'select',
          name: 'level',
          label: 'Level',
          options: spellLevelOptions,
          required: true,
        },
      ],
    },
    {
      type: 'combobox',
      name: 'classIds',
      label: 'Classes',
      multiple: true,
      options: ctx.options?.spellcastingClasses ?? [],
      placeholder: 'Choose classes…',
      required: true,
    },
  ]
}

function castingFields(): FormItem[] {
  return [
    {
      kind: 'group',
      legend: 'Casting time',
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'castingTime.normal.value',
              label: 'Amount',
              min: 1,
              required: true,
            },
            {
              type: 'select',
              name: 'castingTime.normal.unit',
              label: 'Unit',
              options: castingTimeUnitOptions,
              required: true,
            },
          ],
        },
        {
          type: 'text',
          name: 'castingTime.normal.trigger',
          label: 'Reaction trigger',
          hint: 'Required for reaction casting times (e.g. Hellish Rebuke).',
          visibility: visibleWhenReactionCastingTime(),
          required: true,
        },
        {
          type: 'switch',
          name: 'castingTime.canBeCastAsRitual',
          label: 'Can be cast as ritual',
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Range',
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'range.kind',
              label: 'Range kind',
              options: rangeKindOptions,
              required: true,
            },
            {
              type: 'number',
              name: 'range.value.value',
              label: 'Distance (ft)',
              min: 0,
              visibility: visibleWhenRangeDistance(),
              required: true,
            },
          ],
        },
        {
          type: 'text',
          name: 'range.description',
          label: 'Special range description',
          visibility: visibleWhenRangeSpecial(),
          required: true,
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Duration',
      fields: [
        {
          type: 'select',
          name: 'duration.kind',
          label: 'Duration kind',
          options: durationKindOptions,
          required: true,
        },
        {
          kind: 'row',
          fields: [
            {
              type: 'number',
              name: 'duration.value',
              label: 'Duration',
              min: 1,
              visibility: visibleWhenDurationTimed(),
              required: true,
            },
            {
              type: 'select',
              name: 'duration.unit',
              label: 'Unit',
              options: durationUnitOptions,
              visibility: visibleWhenDurationTimed(),
              required: true,
            },
          ],
        },
        {
          type: 'switch',
          name: 'duration.concentration',
          label: 'Concentration',
          visibility: visibleWhenDurationTimed(),
        },
        {
          type: 'switch',
          name: 'duration.upTo',
          label: 'Up to',
          visibility: visibleWhenDurationTimed(),
        },
        {
          type: 'text',
          name: 'duration.description',
          label: 'Special duration description',
          visibility: visibleWhenDurationSpecial(),
          required: true,
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Components',
      fields: [
        {
          kind: 'row',
          fields: [
            { type: 'switch', name: 'components.verbal', label: 'Verbal (V)' },
            { type: 'switch', name: 'components.somatic', label: 'Somatic (S)' },
          ],
        },
        {
          type: 'text',
          name: 'components.material.description',
          label: 'Material (M)',
          hint: 'Describe the material component; leave blank if none.',
        },
      ],
    },
    {
      type: 'select',
      name: 'deliveryMethod',
      label: 'Delivery method',
      options: deliveryMethodOptions,
      hint: 'Attack-roll delivery for cantrips and spells that use spell attacks.',
    },
  ]
}

function tagFields(): FormItem[] {
  return [
    {
      type: 'chips',
      name: 'tags.roles',
      label: 'Roles',
      options: roleTagOptions,
    },
    {
      type: 'chips',
      name: 'tags.functions',
      label: 'Functions',
      options: functionTagOptions,
    },
    {
      type: 'chips',
      name: 'tags.damageTypes',
      label: 'Damage types',
      options: damageTypeOptions,
    },
    {
      type: 'chips',
      name: 'tags.conditions',
      label: 'Conditions',
      options: conditionTagOptions,
    },
  ]
}

function buildSpellTabs(ctx: ContentFormCtx): TabbedFormTab[] {
  return [
    { id: 'basics', label: 'Basics', fields: basicsFields(ctx) },
    { id: 'casting', label: 'Casting', fields: castingFields() },
    { id: 'tags', label: 'Tags', fields: tagFields() },
  ]
}

function toInput(values: SpellFormValues, ctx?: ContentFormInputCtx<Spell>): CreateSpellInput {
  const rawDelivery = values.deliveryMethod?.trim()
  const deliveryMethod =
    rawDelivery && rawDelivery !== SPELL_DELIVERY_METHOD_NONE
      ? spellDeliveryMethodSchema.parse(rawDelivery)
      : undefined

  const input = createSpellInputSchema.parse({
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
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

const spellFormDef: ContentFormDef<Spell, SpellFormValues, CreateSpellInput> = {
  routeKey: 'spells',
  schema: spellFormSchema,
  coverage: 'roundtrip-only',
  createDefaultValues: spellCreateDefaultValues,
  buildTabs: buildSpellTabs,
  buildFields: (ctx) => contentFormFields(spellFormDef, ctx),
  toFormValues: (entity) => ({
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    school: entity.school,
    level: entity.level,
    classIds: entity.classIds,
    castingTime: spellCastingTimeToFormValues(entity.castingTime),
    range: spellRangeToFormValues(entity.range),
    duration: spellDurationToFormValues(entity.duration),
    components: spellComponentsToFormValues(entity.components),
    tags: spellTagsToFormValues(entity.tags),
    deliveryMethod: entity.deliveryMethod ?? SPELL_DELIVERY_METHOD_NONE,
  }),
  toInput,
  useListQuery: useSpells,
  queryKey: spellsQueryKey,
}

contentFormRegistry['spells'] = spellFormDef

export { spellFormDef, spellFormSchema }
export type { SpellFormValues }
