import { type z } from 'zod'

import { pcCharacterSchema } from '../character/sheet'
import { characterCardCampaignSchema } from '../character/character-card-dtos'

// ---------------------------------------------------------------------------
// PC list item — stored character plus optional open-campaign summary.
// ---------------------------------------------------------------------------

export const pcCharacterListItemSchema = pcCharacterSchema.extend({
  campaign: characterCardCampaignSchema.optional(),
})

export type PcCharacterListItem = z.infer<typeof pcCharacterListItemSchema>
