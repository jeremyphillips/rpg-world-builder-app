import { z } from 'zod'
import {
  DEFAULT_SPECIES_CLASS_POLICY_MODE,
  DEFAULT_SPECIES_MULTICLASS_POLICY,
  SPECIES_CLASS_POLICY_MODES_REQUIRING_IDS,
  speciesMulticlassingSchema,
  type SpeciesClassPolicyMode,
} from '@rpg/contracts'
import { type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { effectiveMaxFromCtx } from '../../lib/form-options/content-campaign-rules'
import { getLevelFieldOptions, levelSelectDigits } from '../../lib/form-options/level-field-options'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import {
  speciesClassPolicyModeOptions,
  speciesMulticlassPolicyOptions,
} from './species-rules-form-labels'

export const MULTICLASSING_FIELD_PREFIX = 'characterCreation.multiclassing'
export const LEVEL_LIMITS_FIELD_PREFIX = 'characterCreation.levelLimits'
export const CLASS_POLICY_MODE_FIELD = 'classPolicy.mode'
export const ENABLE_CLASS_LEVEL_CAPS_FIELD = 'enableClassLevelCaps'

export const speciesLevelLimitsFormSchema = z
  .object({
    limitMaxCharacterLevel: z.boolean().default(false),
    maxCharacterLevel: z.number().int().min(1).optional(),
    enableClassLevelCaps: z.boolean().default(false),
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

export function characterConfigurationMulticlassingHref(campaignId: string): string {
  return `/campaigns/${campaignId}/homebrew/rules-config/character-configuration#multiclassing`
}

export function multiclassingPolicyFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'select',
      name: 'policy',
      label: 'Species multiclassing',
      labelPosition: 'settings',
      separator: 'subtle',
      options: speciesMulticlassPolicyOptions,
      required: true,
      width: 'full',
      defaultValue: DEFAULT_SPECIES_MULTICLASS_POLICY,
      hint: 'Controls whether characters of this species can multiclass when the campaign allows multiclassing.',
    },
    {
      type: 'select',
      name: 'classPolicy.mode',
      labelPosition: 'settings',
      separator: 'subtle',
      label: 'Class restrictions',
      width: 'full',
      options: speciesClassPolicyModeOptions,
      required: true,
      defaultValue: DEFAULT_SPECIES_CLASS_POLICY_MODE,
      hint: 'Choose which classes this species may multiclass into.',
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
          label: 'Maximum class level',
          options: levelOptions,
          required: true,
          digits: levelDigits,
          width: 'auto',
        },
      ],
    },
  ]
}

export function speciesLevelLimitsFields(ctx: ContentFormCtx): FormItem[] {
  const levelOptions = getLevelFieldOptions(ctx)
  const levelDigits = levelSelectDigits(ctx)
  const campaignMax = effectiveMaxFromCtx(ctx)

  return [
    {
      kind: 'stack',
      layout: 'toggleDependent',
      dependentsChrome: 'subtle',
      fields: [
        {
          type: 'switch',
          name: 'limitMaxCharacterLevel',
          label: 'Set species maximum level',
          hint: 'Caps the total character level for characters using this species. Leave off to use the campaign maximum.',
          defaultValue: false,
          labelPosition: 'settings',
          separator: 'subtle',
        },
        {
          type: 'select',
          name: 'maxCharacterLevel',
          label: 'Maximum character level',
          options: levelOptions,
          required: true,
          digits: levelDigits,
          labelPosition: 'settings',
          defaultValue: String(campaignMax),
          hint: `Must be at most the campaign maximum (${campaignMax}).`,
        },
      ],
    },
    {
      kind: 'stack',
      layout: 'toggleDependent',
      dependentsChrome: 'subtle',
      dependentsChromeScope: 'arrayItems',
      fields: [
        {
          type: 'switch',
          name: ENABLE_CLASS_LEVEL_CAPS_FIELD,
          label: 'Class-specific limits',
          hint: 'Optionally limit how far this species can progress in individual classes.',
          defaultValue: false,
          labelPosition: 'settings',
        },
        {
          kind: 'array',
          name: 'classLevelCaps',
          legend: '',
          addLabel: 'Add class limit',
          itemCollapsible: true,
          itemHeader: {
            fallback: (index: number) => `Class limit ${index + 1}`,
            primary: (values: Record<string, unknown>) => {
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
      ],
    },
  ]
}
