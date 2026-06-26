import { z } from 'zod'

import { systemRulesetIdSchema } from '../primitives/ruleset'
import { vocabularyOptionSetPatchSchema } from '../vocab/vocabulary'

/** Campaign ruleset patch document — vocabulary deltas keyed by (campaignId, rulesetId). */
export const campaignRulesetPatchSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  rulesetId: systemRulesetIdSchema,
  vocabulary: z.array(vocabularyOptionSetPatchSchema).optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type CampaignRulesetPatch = z.infer<typeof campaignRulesetPatchSchema>
