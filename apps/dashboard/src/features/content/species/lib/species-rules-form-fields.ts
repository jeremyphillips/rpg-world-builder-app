import { z } from 'zod'
import {
  defaultSpeciesMulticlassing,
  SPECIES_CLASS_POLICY_MODES,
  SPECIES_CLASS_POLICY_MODES_REQUIRING_IDS,
  SPECIES_MULTICLASS_POLICIES,
  speciesLevelLimitsSchema,
  speciesMulticlassingSchema,
  type Species,
  type SpeciesCharacterCreation,
  type SpeciesClassPolicyMode,
  type SpeciesMulticlassPolicy,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { getLevelFieldOptions, levelSelectDigits } from '../../lib/level-field-options'
import type { ContentFormCtx } from '../../lib/content-form-registry'

export const SPECIES_MULTICLASS_POLICY_LABELS = {
  inherit: 'Inherit campaign default',
  allowed: 'Allowed',
  forbidden: 'Forbidden',
  restricted: 'Restricted',
} as const satisfies Record<SpeciesMulticlassPolicy, string>

export const SPECIES_CLASS_POLICY_MODE_LABELS = {
  all: 'All classes',
  only: 'Only listed classes',
  all_except: 'All except listed classes',
} as const satisfies Record<SpeciesClassPolicyMode, string>

export const MULTICLASSING_FIELD_PREFIX = 'characterCreation.multiclassing'
export const LEVEL_LIMITS_FIELD_PREFIX = 'characterCreation.levelLimits'
export const CLASS_POLICY_MODE_FIELD = `${MULTICLASSING_FIELD_PREFIX}.classPolicy.mode`

const speciesMulticlassPolicyOptions = toOptions(
  SPECIES_MULTICLASS_POLICIES,
  SPECIES_MULTICLASS_POLICY_LABELS,
)

const speciesClassPolicyModeOptions = toOptions(
  SPECIES_CLASS_POLICY_MODES,
  SPECIES_CLASS_POLICY_MODE_LABELS,
)

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
      itemTitle: (values, index) => {
        const classId = values['classId'] as string | undefined
        const maxLevelValue = values['maxLevel'] as string | number | undefined
        if (classId && maxLevelValue !== undefined) {
          return `${classId} · level ${maxLevelValue}`
        }
        return `Class cap ${index + 1}`
      },
      fields: classLevelCapItemFields(ctx),
    },
  ]
}

export function defaultSpeciesCharacterCreationFormValues(): SpeciesCharacterCreationForm {
  return {
    multiclassing: defaultSpeciesMulticlassing(),
    levelLimits: {
      limitMaxCharacterLevel: false,
      maxCharacterLevel: undefined,
      classLevelCaps: [],
    },
  }
}

export function characterCreationToFormValues(
  characterCreation: Species['characterCreation'] | undefined,
): SpeciesCharacterCreationForm | undefined {
  if (!characterCreation) return undefined

  const form: SpeciesCharacterCreationForm = {}

  if (characterCreation.multiclassing) {
    form.multiclassing = characterCreation.multiclassing
  }

  if (characterCreation.levelLimits) {
    form.levelLimits = {
      limitMaxCharacterLevel: characterCreation.levelLimits.maxCharacterLevel !== null,
      maxCharacterLevel: characterCreation.levelLimits.maxCharacterLevel ?? undefined,
      classLevelCaps: characterCreation.levelLimits.classLevelCaps,
    }
  }

  return Object.keys(form).length > 0 ? form : undefined
}

export function characterCreationFromFormValues(
  characterCreation: SpeciesCharacterCreationForm | undefined,
): SpeciesCharacterCreation | undefined {
  if (!characterCreation) return undefined

  const result: SpeciesCharacterCreation = {}

  if (characterCreation.multiclassing) {
    result.multiclassing = speciesMulticlassingSchema.parse(characterCreation.multiclassing)
  }

  if (characterCreation.levelLimits) {
    const limits = characterCreation.levelLimits
    result.levelLimits = speciesLevelLimitsSchema.parse({
      maxCharacterLevel: limits.limitMaxCharacterLevel ? (limits.maxCharacterLevel ?? null) : null,
      classLevelCaps: limits.classLevelCaps,
    })
  }

  return Object.keys(result).length > 0 ? result : undefined
}

export function refineSpeciesCharacterCreationForm(
  values: SpeciesCharacterCreationForm | undefined,
  ctx: ContentFormCtx,
  refinementCtx: z.RefinementCtx,
): void {
  if (!values?.levelLimits?.limitMaxCharacterLevel) return

  const campaignMax = ctx.campaignRules?.maxCharacterLevel ?? 20
  const maxLevel = values.levelLimits.maxCharacterLevel

  if (maxLevel === undefined) {
    refinementCtx.addIssue({
      code: 'custom',
      message: 'Max character level is required when the limit is enabled',
      path: ['characterCreation', 'levelLimits', 'maxCharacterLevel'],
    })
    return
  }

  if (maxLevel > campaignMax) {
    refinementCtx.addIssue({
      code: 'custom',
      message: `Max character level cannot exceed the campaign cap (${campaignMax})`,
      path: ['characterCreation', 'levelLimits', 'maxCharacterLevel'],
    })
  }

  values.levelLimits.classLevelCaps.forEach((cap, index) => {
    if (cap.maxLevel > campaignMax) {
      refinementCtx.addIssue({
        code: 'custom',
        message: `Class level cap cannot exceed the campaign cap (${campaignMax})`,
        path: ['characterCreation', 'levelLimits', 'classLevelCaps', index, 'maxLevel'],
      })
    }
  })
}
