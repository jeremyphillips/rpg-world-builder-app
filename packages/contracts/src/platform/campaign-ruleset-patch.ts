import { z } from 'zod'

import { systemRulesetIdSchema } from '../primitives/ruleset'
import { vocabularyOptionSetPatchSchema } from '../vocab/vocabulary'
import {
  campaignCharacterCreationPatchSchema,
  resolvedCampaignCharacterCreationPatchSchema,
} from './campaign-character-creation-patch'
import {
  campaignMechanicsPatchSchema,
  resolvedCampaignMechanicsPatchSchema,
} from './campaign-mechanics-patch'

/** Campaign ruleset patch document — vocabulary deltas keyed by (campaignId, rulesetId). */
export const campaignRulesetPatchSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  rulesetId: systemRulesetIdSchema,
  vocabulary: z.array(vocabularyOptionSetPatchSchema).optional(),
  characterCreation: campaignCharacterCreationPatchSchema.optional(),
  mechanics: campaignMechanicsPatchSchema.optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type CampaignRulesetPatch = z.infer<typeof campaignRulesetPatchSchema>

/** Read DTO for GET /api/campaigns/:campaignId/ruleset-patch. */
export const rulesetPatchReadSchema = z.object({
  characterCreation: resolvedCampaignCharacterCreationPatchSchema,
  mechanics: resolvedCampaignMechanicsPatchSchema,
})

export type RulesetPatchRead = z.infer<typeof rulesetPatchReadSchema>
