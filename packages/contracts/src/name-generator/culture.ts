import { z } from 'zod'

import { vocabularyOptionIdSchema } from '../rpg/vocab/vocabulary'

// ---------------------------------------------------------------------------
// Naming cultures — precise cultural traditions (not broad geographic labels).
// ---------------------------------------------------------------------------

export const nameCultureIdSchema = vocabularyOptionIdSchema

export type NameCultureId = z.infer<typeof nameCultureIdSchema>

export const NAME_CULTURE_ORIGINS = ['real-world', 'historical', 'fictional'] as const

export const nameCultureOriginSchema = z.enum(NAME_CULTURE_ORIGINS)

export type NameCultureOrigin = z.infer<typeof nameCultureOriginSchema>

export const nameCultureSchema = z.object({
  id: nameCultureIdSchema,
  label: z.string().min(1),
  origin: nameCultureOriginSchema,
  regionIds: z.array(nameCultureIdSchema).optional(),
  languageIds: z.array(nameCultureIdSchema).optional(),
  eraIds: z.array(nameCultureIdSchema).optional(),
  speciesIds: z.array(z.string().min(1)).optional(),
  heritageIds: z.array(z.string().min(1)).optional(),
  resolvesToCultureId: nameCultureIdSchema.optional(),
  selectable: z.boolean().optional(),
  description: z.string().min(1).optional(),
})

export type NameCulture = z.infer<typeof nameCultureSchema>

/** Browsing facet ids — regions, settings, eras (name-generator-local). */
export const nameFacetIdSchema = vocabularyOptionIdSchema

export type NameFacetId = z.infer<typeof nameFacetIdSchema>
