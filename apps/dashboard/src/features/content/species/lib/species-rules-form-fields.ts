import { z } from 'zod'
import {
  SPECIES_CLASS_POLICY_MODES_REQUIRING_IDS,
  speciesMulticlassingSchema,
  type SpeciesClassPolicyMode,
} from '@rpg/contracts'
import { type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { getLevelFieldOptions, levelSelectDigits } from '../../lib/form-options/level-field-options'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import {
  speciesClassPolicyModeOptions,
  speciesMulticlassPolicyOptions,
} from './species-rules-form-labels'

export const MULTICLASSING_FIELD_PREFIX = 'characterCreation.multiclassing'
export const LEVEL_LIMITS_FIELD_PREFIX = 'characterCreation.levelLimits'
export const CLASS_POLICY_MODE_FIELD = `${MULTICLASSING_FIELD_PREFIX}.classPolicy.mode`

export const speciesLevelLimitsFormSchema = z
  .object({
    limitMaxCharacterLevel: z.boolean().default(false),
    maxCharacterLevel: z.number().int().min(1).optional(),
    classLevelCaps: z.array(
      z.object({
        classId: z.string().min(1),
        maxLevel: z.number().int().min(1),
      }),
    ),
  })
  .strict()

export const speciesCharacterCreationFormSchema = z
  .object({
    multiclassing: speciesMulticlassingSchema.optional(),
    levelLimits: speciesLevelLimitsFormSchema.optional(),
  })
  .strict()

export type SpeciesLevelLimitsForm = z.infer<typeof speciesLevelLimitsFormSchema>
export type SpeciesCharacterCreationForm = z.infer<typeof speciesCharacterCreationFormSchema>

function visibleWhenClassPolicyNeedsIds(): FieldVisibility {
  return {
    dependsOn: [CLASS_POLICY_MODE_FIELD],
    visibleWhen: (watched) => {
      const mode = watched[CLASS_POLICY_MODE_FIELD] as SpeciesClassPolicyMode | undefined
      return mode !== undefined && SPECIES_CLASS_POLICY_MODES_REQUIRING_IDS.includes(mode)
    },
  }
}

function visibleWhenCharacterLevelCapEnabled(): FieldVisibility {
  return {
    dependsOn: [`${LEVEL_LIMITS_FIELD_PREFIX}.limitMaxCharacterLevel`],
    visibleWhen: (watched) =>
      watched[`${LEVEL_LIMITS_FIELD_PREFIX}.limitMaxCharacterLevel`] === true,
  }
}

export function characterConfigurationMulticlassingHref(campaignId: string): string {
  return `/campaigns/${campaignId}/homebrew/rules-config/character-configuration#multiclassing`
}

export function multiclassingPolicyFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'select',
      name: 'policy',
      label: 'Multiclass policy',
      labelPosition: 'settings',
      separator: 'subtle',
      options: speciesMulticlassPolicyOptions,
      required: true,
      width: 'full',
      hint: 'How this species interacts with multiclassing when the campaign allows it.',
    },
    {
      type: 'select',
      name: 'classPolicy.mode',
      labelPosition: 'settings',
      separator: 'subtle',
      label: 'Class policy',
      width: 'full',
      options: speciesClassPolicyModeOptions,
      required: true,
      hint: 'Which classes this species may multiclass into when policy is restricted.',
    },
    {
      type: 'combobox',
      name: 'classPolicy.classIds',
      label: 'Classes',
      multiple: true,
      options: ctx.options?.classes ?? [],
      placeholder: 'Choose classes…',
      required: true,
      visibility: visibleWhenClassPolicyNeedsIds(),
    },
  ]
}

function classLevelCapItemFields(ctx: ContentFormCtx): FormItem[] {
  const levelOptions = getLevelFieldOptions(ctx)
  const levelDigits = levelSelectDigits(ctx)

  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'combobox',
          name: 'classId',
          label: 'Class',
          options: ctx.options?.classes ?? [],
          placeholder: 'Choose a class…',
          required: true,
          width: 'lg',
        },
        {
          type: 'select',
          name: 'maxLevel',
          label: 'Max level',
          options: levelOptions,
          required: true,
          digits: levelDigits,
          width: 'auto',
          separator: 'subtle',
        },
      ],
    },
  ]
}

export function speciesLevelLimitsFields(ctx: ContentFormCtx): FormItem[] {
  const levelOptions = getLevelFieldOptions(ctx)
  const levelDigits = levelSelectDigits(ctx)
  const maxLevel = ctx.campaignRules?.maxCharacterLevel ?? 20

  return [
    {
      type: 'switch',
      name: 'limitMaxCharacterLevel',
      label: 'Limit max character level',
      hint: 'Cap total character level for this species (campaign max is ' + maxLevel + ').',
      defaultValue: false,
      labelPosition: 'settings',
      separator: 'subtle',
    },
    {
      type: 'select',
      name: 'maxCharacterLevel',
      label: 'Max character level',
      options: levelOptions,
      required: true,
      digits: levelDigits,
      width: 'auto',
      separator: 'subtle',
      visibility: visibleWhenCharacterLevelCapEnabled(),
    },
    {
      kind: 'array',
      name: 'classLevelCaps',
      legend: 'Class level caps',
      addLabel: 'Add class cap',
      itemHeader: {
        fallback: (index) => `Class cap ${index + 1}`,
        primary: (values) => {
          const classId = values['classId'] as string | undefined
          const maxLevelValue = values['maxLevel'] as string | number | undefined
          if (classId && maxLevelValue !== undefined) {
            return `${classId} · level ${maxLevelValue}`
          }
          return undefined
        },
      },
      fields: classLevelCapItemFields(ctx),
    },
  ]
}
