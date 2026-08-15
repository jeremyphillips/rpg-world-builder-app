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
import {
  getContentTypeItemLabel,
  getContentTypeMidSentenceLabel,
  formatChooseContentTypePlaceholder,
} from '../../lib/content-type-labels'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { campaignSettingHref } from '@/lib/availability'
import {
  SPECIES_CLASS_POLICY_ALLOWED_CLASSES_HINT,
  SPECIES_CLASS_POLICY_ALLOWED_CLASSES_LABEL,
  SPECIES_CLASS_POLICY_FORBIDDEN_CLASSES_HINT,
  SPECIES_CLASS_POLICY_FORBIDDEN_CLASSES_LABEL,
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

function visibleWhenClassPolicyMode(mode: SpeciesClassPolicyMode): FieldVisibility {
  return {
    dependsOn: [CLASS_POLICY_MODE_FIELD],
    visibleWhen: (watched) => watched[CLASS_POLICY_MODE_FIELD] === mode,
  }
}

function classPolicyClassIdFields(ctx: ContentFormCtx): FormItem[] {
  const classOptions = ctx.options?.classes ?? []

  return [
    {
      type: 'combobox',
      name: 'classPolicy.classIds',
      label: SPECIES_CLASS_POLICY_ALLOWED_CLASSES_LABEL,
      hint: SPECIES_CLASS_POLICY_ALLOWED_CLASSES_HINT,
      multiple: true,
      options: classOptions,
      placeholder: formatChooseContentTypePlaceholder('classes', { plural: true }),
      required: true,
      visibility: visibleWhenClassPolicyMode('only'),
    },
    {
      type: 'combobox',
      name: 'classPolicy.classIds',
      label: SPECIES_CLASS_POLICY_FORBIDDEN_CLASSES_LABEL,
      hint: SPECIES_CLASS_POLICY_FORBIDDEN_CLASSES_HINT,
      multiple: true,
      options: classOptions,
      placeholder: formatChooseContentTypePlaceholder('classes', { plural: true }),
      required: true,
      visibility: visibleWhenClassPolicyMode('all_except'),
    },
  ]
}

export function characterConfigurationMulticlassingHref(campaignId: string): string {
  return campaignSettingHref(campaignId, 'characterCreation.multiclassing.enabled')
}

export function multiclassingPolicyFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'select',
      name: 'policy',
      label: `${getContentTypeItemLabel('species')} multiclassing`,
      labelPosition: 'settings',
      separator: 'subtle',
      options: speciesMulticlassPolicyOptions,
      required: true,
      width: 'full',
      defaultValue: DEFAULT_SPECIES_MULTICLASS_POLICY,
      hint: `Controls whether characters of this ${getContentTypeMidSentenceLabel('species')} can multiclass when the campaign allows multiclassing.`,
    },
    {
      kind: 'dependent',
      separator: 'subtle',
      controller: {
        type: 'select',
        name: 'classPolicy.mode',
        labelPosition: 'settings',
        label: `${getContentTypeItemLabel('classes')} restrictions`,
        width: 'full',
        options: speciesClassPolicyModeOptions,
        required: true,
        defaultValue: DEFAULT_SPECIES_CLASS_POLICY_MODE,
        hint: `Choose which classes this ${getContentTypeMidSentenceLabel('species')} may multiclass into.`,
      },
      dependents: {
        visibility: visibleWhenClassPolicyNeedsIds(),
        chrome: 'panel',
        panel: { surface: { emphasis: 'subtle' } },
        fields: classPolicyClassIdFields(ctx),
      },
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
          label: getContentTypeItemLabel('classes'),
          options: ctx.options?.classes ?? [],
          placeholder: formatChooseContentTypePlaceholder('classes'),
          required: true,
          width: 'lg',
        },
        {
          type: 'select',
          name: 'maxLevel',
          label: `Maximum ${getContentTypeMidSentenceLabel('classes')} level`,
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
      kind: 'dependent',
      separator: 'subtle',
      controller: {
        type: 'switch',
        name: 'limitMaxCharacterLevel',
        label: `Set ${getContentTypeMidSentenceLabel('species')} maximum level`,
        hint: `Caps the total character level for characters using this ${getContentTypeMidSentenceLabel('species')}. Leave off to use the campaign maximum.`,
        defaultValue: false,
        labelPosition: 'settings',
      },
      dependents: {
        chrome: 'panel',
        panel: { surface: { emphasis: 'subtle' } },
        fields: [
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
    },
    {
      kind: 'dependent',
      controller: {
        type: 'switch',
        name: ENABLE_CLASS_LEVEL_CAPS_FIELD,
        label: `${getContentTypeItemLabel('classes')}-specific limits`,
        hint: `Optionally limit how far this ${getContentTypeMidSentenceLabel('species')} can progress in individual classes.`,
        defaultValue: false,
        labelPosition: 'settings',
      },
      dependents: {
        fields: [
          {
            kind: 'array',
            name: 'classLevelCaps',
            legend: '',
            addAction: { label: `Add ${getContentTypeMidSentenceLabel('classes')} limit` },
            item: {
              collapsible: true,
              header: {
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
            },
            fields: classLevelCapItemFields(ctx),
          },
        ],
      },
    },
  ]
}
