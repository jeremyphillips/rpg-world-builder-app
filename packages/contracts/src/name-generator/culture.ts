import { z } from 'zod'

import { vocabularyOptionIdSchema } from '../rpg/vocab/vocabulary'

// ---------------------------------------------------------------------------
// Naming cultures — generator-specific cultural traditions for conventions.
// Species cultural affiliation uses the same id namespace (species slug or culture.id override).
// ---------------------------------------------------------------------------

export const namingCultureIdSchema = vocabularyOptionIdSchema

export type NamingCultureId = z.infer<typeof namingCultureIdSchema>

export const NAMING_CULTURE_ORIGINS = ['real-world', 'historical', 'fictional'] as const

export const namingCultureOriginSchema = z.enum(NAMING_CULTURE_ORIGINS)

export type NamingCultureOrigin = z.infer<typeof namingCultureOriginSchema>

export const namingCultureSchema = z.object({
  id: namingCultureIdSchema,
  label: z.string().min(1),
  origin: namingCultureOriginSchema,
  regionIds: z.array(namingCultureIdSchema).optional(),
  languageIds: z.array(namingCultureIdSchema).optional(),
  eraIds: z.array(namingCultureIdSchema).optional(),
  speciesIds: z.array(z.string().min(1)).optional(),
  heritageIds: z.array(z.string().min(1)).optional(),
  resolvesToCultureId: namingCultureIdSchema.optional(),
  selectable: z.boolean().optional(),
  description: z.string().min(1).optional(),
})

export type NamingCulture = z.infer<typeof namingCultureSchema>

/** Browsing facet ids — regions, settings, eras (name-generator-local). */
export const nameFacetIdSchema = vocabularyOptionIdSchema

export type NameFacetId = z.infer<typeof nameFacetIdSchema>
