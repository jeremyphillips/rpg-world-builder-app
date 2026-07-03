import { z } from 'zod'

export const DEFAULT_SUBCLASS_CHOICES_ENABLED = true

/** Sparse stored shape for campaign subclass choice rules. */
export const campaignSubclassingPatchSchema = z
  .object({
    enabled: z.boolean().optional(),
  })
  .strict()

export type CampaignSubclassingPatch = z.infer<typeof campaignSubclassingPatchSchema>

export const resolvedCampaignSubclassingPatchSchema = z.object({
  enabled: z.boolean(),
})

export type ResolvedCampaignSubclassingPatch = z.infer<
  typeof resolvedCampaignSubclassingPatchSchema
>

export function resolveSubclassingRules(
  patch?: CampaignSubclassingPatch,
): ResolvedCampaignSubclassingPatch {
  return {
    enabled: patch?.enabled ?? DEFAULT_SUBCLASS_CHOICES_ENABLED,
  }
}

export function isSparseDefaultSubclassingPatch(patch?: CampaignSubclassingPatch): boolean {
  return resolveSubclassingRules(patch).enabled === DEFAULT_SUBCLASS_CHOICES_ENABLED
}

export function defaultSubclassingRules(): ResolvedCampaignSubclassingPatch {
  return resolveSubclassingRules(undefined)
}

export type SubclassChoicesEnabledValidationResult = {
  valid: boolean
  message?: string
}

/** Stub for future active-character checks before disabling subclass choices. */
export function validateSubclassChoicesEnabledChange(): SubclassChoicesEnabledValidationResult {
  return { valid: true }
}
