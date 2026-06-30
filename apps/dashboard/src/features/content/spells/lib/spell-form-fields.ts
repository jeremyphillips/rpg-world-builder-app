import { z } from 'zod'
import {
  castingTimeUnitSchema,
  damageTypeSchema,
  durationUnitSchema,
  effectConditionSchema,
  slugSchema,
  spellContentLevelSchema,
  spellFunctionTagSchema,
  spellRangeKindSchema,
  spellRoleTagSchema,
  spellSchoolSchema,
} from '@rpg/contracts'
import { type FieldVisibility, type FormItem, type TabbedFormTab } from '@rpg/ui/form'

import {
  feetInputUnitField,
  identityFields,
  SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
} from '../../lib/forms/fields/content-identity-form-fields'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import {
  castingTimeUnitOptions,
  conditionTagOptions,
  damageTypeOptions,
  deliveryMethodOptions,
  durationKindOptions,
  durationUnitOptions,
  functionTagOptions,
  rangeKindOptions,
  roleTagOptions,
  schoolOptions,
  SPELL_DURATION_KINDS,
  spellLevelOptions,
} from './spell-form-labels'

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

function visibleWhenMaterialEnabled(): FieldVisibility {
  return {
    dependsOn: ['components.material.enabled'],
    visibleWhen: (v) => v['components.material.enabled'] === true,
  }
}

function visibleWhenReactionCastingTime(): FieldVisibility {
  return {
    dependsOn: ['castingTime.normal.unit'],
    visibleWhen: (v) => v['castingTime.normal.unit'] === 'reaction',
  }
}

export const spellFormSchema = z
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
      material: z
        .object({
          enabled: z.boolean().optional(),
          description: z.string().optional(),
        })
        .optional(),
    }),
    deliveryMethod: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const hasMaterial =
      values.components.material?.enabled === true &&
      Boolean(values.components.material?.description?.trim())

    const hasComponent =
      values.components.verbal === true || values.components.somatic === true || hasMaterial

    if (!hasComponent) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one spell component (verbal, somatic, or material) is required',
        path: ['components'],
      })
    }

    if (
      values.components.material?.enabled === true &&
      !values.components.material?.description?.trim()
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Material description is required when Material is enabled',
        path: ['components', 'material', 'description'],
      })
    }
  })

export type SpellFormValues = z.infer<typeof spellFormSchema>

function basicsFields(ctx: ContentFormCtx): FormItem[] {
  return [
    ...identityFields(ctx),
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
      kind: 'row',
      fields: [
        {
          type: 'combobox',
          name: 'classIds',
          label: 'Classes',
          multiple: true,
          options: ctx.options?.spellcastingClasses ?? [],
          placeholder: 'Choose classes…',
          required: true,
          width: '1/2',
        },
      ],
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
              type: 'inputSelect',
              name: 'castingTime.normal',
              label: 'Normal',
              inputType: 'number',
              valueKey: 'value',
              unitKey: 'unit',
              options: castingTimeUnitOptions,
              min: 1,
              valueDigits: 1,
              width: 'auto',
              required: true,
              defaultValue: { value: 1, unit: 'action' },
            },
            {
              type: 'switch',
              name: 'castingTime.canBeCastAsRitual',
              label: 'Can be cast as ritual',
              labelPosition: 'above',
              width: 'auto',
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
              label: 'Kind',
              options: rangeKindOptions,
              required: true,
              width: 'lg',
            },
            feetInputUnitField('range.value.value', 'Distance', {
              valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
              width: 'auto',
              visibility: visibleWhenRangeDistance(),
              required: true,
            }),
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
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'duration.kind',
              label: 'Duration kind',
              options: durationKindOptions,
              required: true,
              width: 'lg',
            },
            {
              type: 'inputSelect',
              name: 'duration',
              label: 'Duration',
              inputType: 'number',
              valueKey: 'value',
              unitKey: 'unit',
              options: durationUnitOptions,
              min: 1,
              valueDigits: 2,
              width: 'auto',
              visibility: visibleWhenDurationTimed(),
              required: true,
              defaultValue: { value: 1, unit: 'round' },
            },
            {
              type: 'switch',
              name: 'duration.upTo',
              label: 'Up to',
              labelPosition: 'above',
              width: 'auto',
              visibility: visibleWhenDurationTimed(),
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
            {
              type: 'switch',
              name: 'components.verbal',
              label: 'Verbal (V)',
              width: 'auto',
            },
            {
              type: 'switch',
              name: 'components.somatic',
              label: 'Somatic (S)',
              width: 'auto',
            },
            {
              type: 'switch',
              name: 'components.material.enabled',
              label: 'Material (M)',
              width: 'auto',
            },
          ],
        },
        {
          type: 'text',
          name: 'components.material.description',
          label: 'Material description',
          hint: 'Describe the material component.',
          visibility: visibleWhenMaterialEnabled(),
          required: true,
        },
      ],
    },
    {
      type: 'select',
      name: 'deliveryMethod',
      label: 'Delivery method',
      options: deliveryMethodOptions,
      hint: 'Attack-roll delivery for cantrips and spells that use spell attacks.',
      width: 'xl',
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

export function buildSpellTabs(ctx: ContentFormCtx): TabbedFormTab[] {
  return [
    { id: 'basics', label: 'Basics', fields: basicsFields(ctx) },
    { id: 'casting', label: 'Casting', fields: castingFields() },
    { id: 'tags', label: 'Tags', fields: tagFields() },
  ]
}
