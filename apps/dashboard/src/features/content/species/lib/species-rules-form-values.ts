import type { RefinementCtx } from 'zod'
import {
  defaultSpeciesMulticlassing,
  speciesLevelLimitsSchema,
  speciesMulticlassingSchema,
  type Species,
  type SpeciesCharacterCreation,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import type { SpeciesCharacterCreationForm } from './species-rules-form-fields'

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
  refinementCtx: RefinementCtx,
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
