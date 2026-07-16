import { z } from 'zod'

import { creatureTypeSchema } from '../rpg/vocab/creature-type'
import { languageIdSchema } from '../rpg/vocab/language'
import { nameCultureIdSchema, nameFacetIdSchema } from './culture'

// ---------------------------------------------------------------------------
// Naming associations — independently weighted links between conventions and
// languages, cultures, species, creature types, regions, and settings.
// ---------------------------------------------------------------------------

export const NAMING_ASSOCIATION_STRENGTHS = ['primary', 'secondary', 'influenced'] as const

export const namingAssociationStrengthSchema = z.enum(NAMING_ASSOCIATION_STRENGTHS)

export type NamingAssociationStrength = z.infer<typeof namingAssociationStrengthSchema>

const namingAssociationLanguageSchema = z.object({
  kind: z.literal('language'),
  languageId: languageIdSchema,
  strength: namingAssociationStrengthSchema.optional(),
})

const namingAssociationCultureSchema = z.object({
  kind: z.literal('culture'),
  cultureId: nameCultureIdSchema,
  strength: namingAssociationStrengthSchema.optional(),
})

const namingAssociationSpeciesSchema = z.object({
  kind: z.literal('species'),
  speciesId: z.string().min(1),
})

const namingAssociationCreatureTypeSchema = z.object({
  kind: z.literal('creatureType'),
  creatureType: creatureTypeSchema,
})

const namingAssociationRegionSchema = z.object({
  kind: z.literal('region'),
  regionId: nameFacetIdSchema,
})

const namingAssociationFictionSettingSchema = z.object({
  kind: z.literal('fictionSetting'),
  fictionSettingId: nameFacetIdSchema,
})

export const namingAssociationSchema = z.discriminatedUnion('kind', [
  namingAssociationLanguageSchema,
  namingAssociationCultureSchema,
  namingAssociationSpeciesSchema,
  namingAssociationCreatureTypeSchema,
  namingAssociationRegionSchema,
  namingAssociationFictionSettingSchema,
])

export type NamingAssociation = z.infer<typeof namingAssociationSchema>
