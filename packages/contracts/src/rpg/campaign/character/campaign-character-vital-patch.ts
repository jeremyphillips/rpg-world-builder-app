import { z } from 'zod'

import { characterVitalStatusSchema } from '../../vocab/character-vital-status'

/** Client-writable vital status and note for campaign participation patches. */
export const campaignCharacterVitalPatchSchema = z.object({
  status: characterVitalStatusSchema.optional(),
  note: z.string().optional(),
  changedAt: z.string().datetime().optional(),
})

export type CampaignCharacterVitalPatch = z.infer<typeof campaignCharacterVitalPatchSchema>
