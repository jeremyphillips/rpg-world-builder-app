import { z } from 'zod'
import {
  AREA_GEOMETRY_SHAPES,
  castingTimeUnitSchema,
  damageTypeIdSchema,
  durationUnitSchema,
  effectConditionSchema,
  slugSchema,
  spellContentLevelSchema,
  spellFunctionTagSchema,
  spellRangeKindSchema,
  spellRoleTagSchema,
  spellSchoolIdSchema,
  spellValidationMessages,
} from '@rpg/contracts'
import { type FieldVisibility, type FormItem, type TabbedFormTab } from '@rpg/ui/form'

import {
  buildActiveDamageTypeFieldOptions,
  buildActiveSpellSchoolFieldOptions,
} from '@/features/homebrew'

import {
  descriptionField,
  feetInputUnitField,
  nameField,
  SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
} from '../../lib/forms/fields/content-identity-form-fields'
import { distanceInputSelectField } from '../../lib/forms/fields/content-speed-form-fields'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import {
  castingTimeUnitOptions,
  conditionTagOptions,
  deliveryMethodOptions,
  durationKindOptions,
  durationUnitOptions,
  functionTagOptions,
  areaGeometryShapeOptions,
  rangeKindOptions,
  roleTagOptions,
  SPELL_DURATION_KINDS,
  spellLevelOptions,
} from './spell-form-labels'
import { SPELL_SECTION_LABELS } from './spell-display'
import { optionalResolutionFormSchema } from '../resolution/lib/form/resolution-form-schema'
import { resolutionFields } from '../resolution/lib/form/resolution-form-fields'
import { resolutionOutcomeApplicationsResolverFields } from '../resolution/lib/form/resolution-outcome-form-fields'
import { RESOLUTION_FIELD_NAME } from '../resolution/lib/form/resolution-form-values'
import { spellEffectsFormSchema } from './effects/effect-form-schema'

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

function visibleWhenCantripLevel(): FieldVisibility {
  return {
    dependsOn: ['level'],
    visibleWhen: (v) => v.level === 0,
  }
}

function visibleWhenLeveledSpell(): FieldVisibility {
  return {
    dependsOn: ['level'],
    visibleWhen: (v) => typeof v.level === 'number' && v.level > 0,
  }
}

function visibleWhenAreaShape(shapes: (typeof AREA_GEOMETRY_SHAPES)[number][]): FieldVisibility {
  return {
    dependsOn: ['areaOfEffect.shape'],
    visibleWhen: (v) => {
      const shape = v['areaOfEffect.shape']
      return (
        typeof shape === 'string' && shapes.includes(shape as (typeof AREA_GEOMETRY_SHAPES)[number])
      )
    },
  }
}

export const spellFormSchema = z
  .object({
    name: z.string().min(1),
    slug: slugSchema.optional(),
    description: z.string().optional(),
    cantripScaling: z.string().optional(),
    higherLevelSlotEffect: z.string().optional(),
    school: spellSchoolIdSchema,
    level: spellContentLevelSchema,
    classIds: z.array(z.string()).min(1),
    tags: z
      .object({
        roles: z.array(spellRoleTagSchema).optional(),
        functions: z.array(spellFunctionTagSchema).optional(),
        damageTypes: z.array(damageTypeIdSchema).optional(),
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
    areaOfEffect: z.object({
      shape: z.string(),
      radius: z
        .object({
          value: z.coerce.number(),
          unit: z.literal('ft').optional(),
        })
        .optional(),
      length: z
        .object({
          value: z.coerce.number(),
          unit: z.literal('ft').optional(),
        })
        .optional(),
      width: z
        .object({
          value: z.coerce.number(),
          unit: z.literal('ft').optional(),
        })
        .optional(),
      size: z
        .object({
          value: z.coerce.number(),
          unit: z.literal('ft').optional(),
        })
        .optional(),
      height: z
        .object({
          value: z.coerce.number(),
          unit: z.literal('ft').optional(),
        })
        .optional(),
      description: z.string().optional(),
    }),
    deliveryMethod: z.string().optional(),
    effects: spellEffectsFormSchema,
    resolution: optionalResolutionFormSchema,
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
        message: spellValidationMessages.componentRequired(),
        path: ['components'],
      })
    }

    if (
      values.components.material?.enabled === true &&
      !values.components.material?.description?.trim()
    ) {
      ctx.addIssue({
        code: 'custom',
        message: spellValidationMessages.materialDescriptionRequired(),
        path: ['components', 'material', 'description'],
      })
    }
  })

export type SpellFormValues = z.infer<typeof spellFormSchema>

function basicsFields(ctx: ContentFormCtx): FormItem[] {
  const schoolOptions = buildActiveSpellSchoolFieldOptions(ctx.spellSchoolVocabulary)

  return [
    nameField(),
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
          placeholder: 'Choose level…',
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
    descriptionField(ctx),
    {
      type: 'richtext',
      name: 'cantripScaling',
      label: SPELL_SECTION_LABELS.cantripScaling,
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
      visibility: visibleWhenCantripLevel(),
    },
    {
      type: 'richtext',
      name: 'higherLevelSlotEffect',
      label: SPELL_SECTION_LABELS.higherLevelSlotEffect,
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
      visibility: visibleWhenLeveledSpell(),
    },
  ]
}

function castingFields(): FormItem[] {
  return [
    {
      kind: 'group',
      legend: 'Casting time',
      fieldsChrome: { variant: 'panel' },
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
      fieldsChrome: { variant: 'panel' },
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
      fieldsChrome: { variant: 'outline' },
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
      fieldsChrome: { variant: 'outline' },
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
      kind: 'group',
      legend: 'Area of effect',
      fieldsChrome: { variant: 'outline' },
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'areaOfEffect.shape',
              label: 'Shape',
              options: areaGeometryShapeOptions,
              hint: {
                text: 'Optional structured area geometry. Origin and movement are not modeled yet.',
                position: 'below-control',
              },
              width: 'auto',
            },
            distanceInputSelectField({
              name: 'areaOfEffect.radius',
              label: 'Radius',
              required: true,
              valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
              visibility: visibleWhenAreaShape(['sphere', 'emanation', 'cylinder']),
            }),
          ],
        },
        distanceInputSelectField({
          name: 'areaOfEffect.height',
          label: 'Height',
          required: true,
          valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
          visibility: visibleWhenAreaShape(['cylinder']),
        }),
        distanceInputSelectField({
          name: 'areaOfEffect.length',
          label: 'Length',
          required: true,
          valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
          visibility: visibleWhenAreaShape(['cone', 'line']),
        }),
        distanceInputSelectField({
          name: 'areaOfEffect.width',
          label: 'Width',
          required: true,
          valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
          visibility: visibleWhenAreaShape(['line']),
        }),
        distanceInputSelectField({
          name: 'areaOfEffect.size',
          label: 'Side length',
          required: true,
          valueDigits: SPELL_RANGE_DISTANCE_INLINE_COUNT_DIGITS,
          visibility: visibleWhenAreaShape(['cube']),
        }),
        {
          type: 'text',
          name: 'areaOfEffect.description',
          label: 'Special area description',
          visibility: visibleWhenAreaShape(['special']),
          required: true,
        },
      ],
    },
    {
      type: 'select',
      name: 'deliveryMethod',
      label: 'Delivery method',
      options: deliveryMethodOptions,
      hint: 'Attack-roll delivery for spells that use spell attacks.',
      width: 'auto',
    },
  ]
}

function tagFields(ctx: ContentFormCtx): FormItem[] {
  const damageTypeOptions = buildActiveDamageTypeFieldOptions(ctx.damageTypeVocabulary)

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

function resolutionTabFields(ctx: ContentFormCtx): FormItem[] {
  return resolutionFields(ctx)
}

export function buildSpellTabs(ctx: ContentFormCtx): TabbedFormTab[] {
  return [
    { id: 'basics', label: 'Basics', fields: basicsFields(ctx) },
    { id: 'casting', label: 'Casting', fields: castingFields() },
    {
      id: 'resolution',
      label: 'Resolution',
      fields: resolutionTabFields(ctx),
      errorPaths: [`${RESOLUTION_FIELD_NAME}.outcomes`],
      resolverFields: resolutionOutcomeApplicationsResolverFields(),
    },
    { id: 'tags', label: 'Tags', fields: tagFields(ctx) },
  ]
}
