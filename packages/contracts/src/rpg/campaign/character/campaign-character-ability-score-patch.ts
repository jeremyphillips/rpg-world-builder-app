import { z } from 'zod'

import { abilitySchema, characterAbilityScoreSchema } from '../../vocab/ability'

/** Single-ability patch for campaign manager sheet editing. */
export const campaignCharacterAbilityScorePatchSchema = z.object({
  ability: abilitySchema,
  score: characterAbilityScoreSchema,
})

export type CampaignCharacterAbilityScorePatch = z.infer<
  typeof campaignCharacterAbilityScorePatchSchema
>
