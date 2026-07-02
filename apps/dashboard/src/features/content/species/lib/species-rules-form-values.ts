import type { RefinementCtx } from 'zod'
import {
  defaultSpeciesMulticlassing,
  defineMessage,
  speciesLevelLimitsSchema,
  speciesMulticlassingSchema,
  type Species,
  type SpeciesCharacterCreation,
} from '@rpg/contracts'

import { effectiveMaxFromCtx } from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import type { SpeciesCharacterCreationForm } from './species-rules-form-fields'

/** Species character-creation validation messages (tier 3 form overrides). */
export const speciesCharacterCreationValidationMessages = {
  maxCharacterLevelRequired: defineMessage(
    'validation.speciesCharacterCreation.maxCharacterLevelRequired',
    () => 'Max character level is required when the limit is enabled',
  ),
  maxCharacterLevelExceedsCampaign: defineMessage<{ campaignMax: number }>(
    'validation.speciesCharacterCreation.maxCharacterLevelExceedsCampaign',
    ({ campaignMax }) => `Max character level cannot exceed the campaign cap (${campaignMax})`,
  ),
  classLevelCapExceedsCampaign: defineMessage<{ campaignMax: number }>(
    'validation.speciesCharacterCreation.classLevelCapExceedsCampaign',
    ({ campaignMax }) => `Class level cap cannot exceed the campaign cap (${campaignMax})`,
    () => 'Cap exceeds campaign',
  ),
}

export function mergeMulticlassingFormDefaults(
  multiclassing: SpeciesCharacterCreationForm['multiclassing'],
): NonNullable<SpeciesCharacterCreationForm['multiclassing']> {
  const defaults = defaultSpeciesMulticlassing()
  return {
    policy: multiclassing?.policy ?? defaults.policy,
    classPolicy: {
      mode: multiclassing?.classPolicy?.mode ?? defaults.classPolicy.mode,
      classIds: multiclassing?.classPolicy?.classIds ?? defaults.classPolicy.classIds,
    },
  }
}

export function mergeLevelLimitsFormDefaults(
  levelLimits: SpeciesCharacterCreationForm['levelLimits'],
): NonNullable<SpeciesCharacterCreationForm['levelLimits']> {
  const defaults = defaultSpeciesCharacterCreationFormValues().levelLimits!
  return {
    limitMaxCharacterLevel: levelLimits?.limitMaxCharacterLevel ?? defaults.limitMaxCharacterLevel,
    maxCharacterLevel: levelLimits?.maxCharacterLevel ?? defaults.maxCharacterLevel,
    enableClassLevelCaps: levelLimits?.enableClassLevelCaps ?? defaults.enableClassLevelCaps,
    classLevelCaps: levelLimits?.classLevelCaps ?? defaults.classLevelCaps,
  }
}

export function mergeCharacterCreationFormDefaults(
  characterCreation: SpeciesCharacterCreationForm | undefined,
  options: { policyEnabled: boolean; limitsEnabled: boolean },
): SpeciesCharacterCreationForm {
  const next: SpeciesCharacterCreationForm = { ...(characterCreation ?? {}) }

  if (options.policyEnabled) {
    next.multiclassing = mergeMulticlassingFormDefaults(next.multiclassing)
  }

  if (options.limitsEnabled) {
    next.levelLimits = mergeLevelLimitsFormDefaults(next.levelLimits)
  }

  return next
}

export function defaultSpeciesCharacterCreationFormValues(): SpeciesCharacterCreationForm {
  return {
    multiclassing: defaultSpeciesMulticlassing(),
    levelLimits: {
      limitMaxCharacterLevel: false,
      maxCharacterLevel: undefined,
      enableClassLevelCaps: false,
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
    form.multiclassing = mergeMulticlassingFormDefaults(characterCreation.multiclassing)
  }

  if (characterCreation.levelLimits) {
    form.levelLimits = {
      limitMaxCharacterLevel: characterCreation.levelLimits.maxCharacterLevel !== null,
      maxCharacterLevel: characterCreation.levelLimits.maxCharacterLevel ?? undefined,
      enableClassLevelCaps: characterCreation.levelLimits.classLevelCaps.length > 0,
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
      classLevelCaps: limits.enableClassLevelCaps ? limits.classLevelCaps : [],
    })
  }

  return Object.keys(result).length > 0 ? result : undefined
}

export function refineSpeciesCharacterCreationForm(
  values: SpeciesCharacterCreationForm | undefined,
  ctx: ContentFormCtx,
  refinementCtx: RefinementCtx,
): void {
  const limits = values?.levelLimits
  if (!limits) return

  const campaignMax = effectiveMaxFromCtx(ctx)

  if (limits.limitMaxCharacterLevel) {
    const maxLevel = limits.maxCharacterLevel

    if (maxLevel === undefined) {
      refinementCtx.addIssue({
        code: 'custom',
        message: speciesCharacterCreationValidationMessages.maxCharacterLevelRequired(),
        path: ['characterCreation', 'levelLimits', 'maxCharacterLevel'],
      })
    } else if (maxLevel > campaignMax) {
      refinementCtx.addIssue({
        code: 'custom',
        message: speciesCharacterCreationValidationMessages.maxCharacterLevelExceedsCampaign({
          campaignMax,
        }),
        path: ['characterCreation', 'levelLimits', 'maxCharacterLevel'],
      })
    }
  }

  if (!limits.enableClassLevelCaps) return

  limits.classLevelCaps.forEach((cap, index) => {
    if (cap.maxLevel > campaignMax) {
      refinementCtx.addIssue({
        code: 'custom',
        message: speciesCharacterCreationValidationMessages.classLevelCapExceedsCampaign({
          campaignMax,
        }),
        path: ['characterCreation', 'levelLimits', 'classLevelCaps', index, 'maxLevel'],
      })
    }
  })
}
