import { z } from 'zod'

export const CHARACTER_CAMPAIGN_CONTENT_REFERENCE_TYPES = [
  'species',
  'class',
  'subclass',
  'equipment',
  'spells',
  'feats',
  'proficiencies',
  'tools',
  'languages',
  'heritage',
] as const

export const characterCampaignContentReferenceTypeSchema = z.enum(
  CHARACTER_CAMPAIGN_CONTENT_REFERENCE_TYPES,
)

export type CharacterCampaignContentReferenceType = z.infer<
  typeof characterCampaignContentReferenceTypeSchema
>
