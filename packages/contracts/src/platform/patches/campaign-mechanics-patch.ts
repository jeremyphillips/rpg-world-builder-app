import { z } from 'zod'

import {
  attackResolutionModeIdSchema,
  DEFAULT_EDITION_PRESET_ID,
  editionPresetIdSchema,
  getEditionPresetMechanics,
  type EditionPresetId,
} from '../../vocab/mechanics'
import {
  ARMOR_CLASS_BASES,
  ARMOR_CLASS_MODES,
  type ArmorClassBase,
  type ArmorClassMode,
} from '../../vocab/mechanics/edition-preset-mechanics'

export const armorClassModeSchema = z.enum(ARMOR_CLASS_MODES)

export const armorClassBaseSchema = z.union([
  z.literal(ARMOR_CLASS_BASES[0]),
  z.literal(ARMOR_CLASS_BASES[1]),
])

export const DEFAULT_ARMOR_CLASS_MODE = 'ascending' as const satisfies ArmorClassMode

export const DEFAULT_ARMOR_CLASS_BASE = 10 as const satisfies ArmorClassBase

const armorClassPatchSchema = z
  .object({
    mode: armorClassModeSchema.optional(),
    base: armorClassBaseSchema.optional(),
  })
  .strict()

const attackResolutionPatchSchema = z
  .object({
    mode: attackResolutionModeIdSchema.optional(),
  })
  .strict()

const editionPresetPatchSchema = z
  .object({
    id: editionPresetIdSchema.optional(),
    modified: z.boolean().optional(),
    appliedAt: z.iso.datetime().optional(),
  })
  .strict()

/** Sparse mechanics patch stored on CampaignRulesetPatch. */
export const campaignMechanicsPatchSchema = z
  .object({
    editionPreset: editionPresetPatchSchema.optional(),
    armorClass: armorClassPatchSchema.optional(),
    attackResolution: attackResolutionPatchSchema.optional(),
  })
  .strict()

export type CampaignMechanicsPatch = z.infer<typeof campaignMechanicsPatchSchema>

export const resolvedEditionPresetSchema = z.object({
  id: editionPresetIdSchema,
  modified: z.boolean(),
  appliedAt: z.iso.datetime().optional(),
})

export type ResolvedEditionPreset = z.infer<typeof resolvedEditionPresetSchema>

export const resolvedArmorClassSchema = z.object({
  mode: armorClassModeSchema,
  base: armorClassBaseSchema,
})

export type ResolvedArmorClass = z.infer<typeof resolvedArmorClassSchema>

export const resolvedAttackResolutionSchema = z.object({
  mode: attackResolutionModeIdSchema,
})

export type ResolvedAttackResolution = z.infer<typeof resolvedAttackResolutionSchema>

/** Mechanics patch with campaign defaults applied — returned from GET ruleset-patch. */
export const resolvedCampaignMechanicsPatchSchema = z.object({
  editionPreset: resolvedEditionPresetSchema,
  armorClass: resolvedArmorClassSchema,
  attackResolution: resolvedAttackResolutionSchema,
})

export type ResolvedCampaignMechanicsPatch = z.infer<typeof resolvedCampaignMechanicsPatchSchema>

export type ResolvedMechanicsKnobs = Pick<
  ResolvedCampaignMechanicsPatch,
  'armorClass' | 'attackResolution'
>

/** Materializes mechanics knobs from a sparse patch and preset id. */
export function resolveMechanicsKnobsFromPatch(
  patch: CampaignMechanicsPatch | undefined,
  presetId: EditionPresetId,
): ResolvedMechanicsKnobs {
  const bundle = getEditionPresetMechanics(presetId)

  return {
    armorClass: {
      mode: patch?.armorClass?.mode ?? bundle.armorClass.mode,
      base: patch?.armorClass?.base ?? bundle.armorClass.base,
    },
    attackResolution: {
      mode: patch?.attackResolution?.mode ?? bundle.attackResolution.mode,
    },
  }
}

/** True when stored knob values differ from the bundle for the given preset id. */
export function mechanicsDriftFromPreset(
  presetId: EditionPresetId,
  knobs: ResolvedMechanicsKnobs,
): boolean {
  const bundle = getEditionPresetMechanics(presetId)

  return (
    knobs.armorClass.mode !== bundle.armorClass.mode ||
    knobs.armorClass.base !== bundle.armorClass.base ||
    knobs.attackResolution.mode !== bundle.attackResolution.mode
  )
}

/** Applies campaign defaults to a sparse mechanics patch. */
export function resolveMechanicsPatch(
  patch?: CampaignMechanicsPatch,
): ResolvedCampaignMechanicsPatch {
  const presetId = patch?.editionPreset?.id ?? DEFAULT_EDITION_PRESET_ID
  const knobs = resolveMechanicsKnobsFromPatch(patch, presetId)
  const modified = patch?.editionPreset?.modified ?? mechanicsDriftFromPreset(presetId, knobs)

  return {
    editionPreset: {
      id: presetId,
      modified,
      ...(patch?.editionPreset?.appliedAt !== undefined && {
        appliedAt: patch.editionPreset.appliedAt,
      }),
    },
    armorClass: knobs.armorClass,
    attackResolution: knobs.attackResolution,
  }
}

const updateCampaignMechanicsInputObjectSchema = z
  .object({
    editionPreset: z
      .object({
        id: editionPresetIdSchema,
      })
      .strict()
      .optional(),
    armorClass: armorClassPatchSchema.optional(),
    attackResolution: attackResolutionPatchSchema.optional(),
  })
  .strict()

/** Partial update payload for PATCH ruleset-patch mechanics. Server owns modified/appliedAt. */
export const updateCampaignMechanicsInputSchema = updateCampaignMechanicsInputObjectSchema.partial()

export type UpdateCampaignMechanicsInput = z.infer<typeof updateCampaignMechanicsInputSchema>

/** SRD / default mechanics for new campaigns before any explicit patch is stored. */
export function defaultCampaignMechanicsPatch(): ResolvedCampaignMechanicsPatch {
  return resolveMechanicsPatch(undefined)
}
