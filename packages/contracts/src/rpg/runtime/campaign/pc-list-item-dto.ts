import { type z } from 'zod'

import { pcCharacterSchema } from '../character/sheet'
import { characterCardCampaignSchema } from '../character/character-card-dtos'
import { characterRouteContextSchema } from './character-route-context'

// ---------------------------------------------------------------------------
// PC list item — stored character plus route context and optional campaign label.
// ---------------------------------------------------------------------------

export const pcCharacterListItemSchema = pcCharacterSchema.extend({
  routeContext: characterRouteContextSchema,
  campaign: characterCardCampaignSchema.optional(),
})

export type PcCharacterListItem = z.infer<typeof pcCharacterListItemSchema>
