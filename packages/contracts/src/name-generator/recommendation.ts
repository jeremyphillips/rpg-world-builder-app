import { z } from 'zod'

import { creatureTypeSchema } from '../rpg/vocab/creature-type'
import { languageIdSchema } from '../rpg/vocab/language'
import { namingCultureIdSchema, nameFacetIdSchema } from './culture'
import { namingAssociationStrengthSchema } from './naming-association'
import { nameSubjectKindSchema } from './subject-kind'

// ---------------------------------------------------------------------------
// Recommendation — pure context input and scored convention matches.
// ---------------------------------------------------------------------------

export const namingContextSchema = z.object({
  subjectKind: nameSubjectKindSchema,
  languageIds: z.array(languageIdSchema).optional(),
  cultureIds: z.array(namingCultureIdSchema).optional(),
  conventionCultureIds: z.array(namingCultureIdSchema).optional(),
  cultureResolutions: z.record(namingCultureIdSchema, namingCultureIdSchema).optional(),
  speciesIds: z.array(z.string().min(1)).optional(),
  heritageIds: z.array(z.string().min(1)).optional(),
  creatureTypes: z.array(creatureTypeSchema).optional(),
  regionIds: z.array(nameFacetIdSchema).optional(),
  fictionSettingIds: z.array(nameFacetIdSchema).optional(),
  tags: z.array(z.string().min(1)).optional(),
})

export type NamingContext = z.infer<typeof namingContextSchema>

const namingRecommendationReasonLanguageSchema = z.object({
  kind: z.literal('language'),
  languageId: languageIdSchema,
  strength: namingAssociationStrengthSchema,
})

const namingRecommendationReasonCultureSchema = z.object({
  kind: z.literal('culture'),
  cultureId: namingCultureIdSchema,
  strength: namingAssociationStrengthSchema,
})

const namingRecommendationReasonSpeciesSchema = z.object({
  kind: z.literal('species'),
  speciesId: z.string().min(1),
})

const namingRecommendationReasonCreatureTypeSchema = z.object({
  kind: z.literal('creatureType'),
  creatureType: creatureTypeSchema,
})

const namingRecommendationReasonRegionSchema = z.object({
  kind: z.literal('region'),
  regionId: nameFacetIdSchema,
})

const namingRecommendationReasonFictionSettingSchema = z.object({
  kind: z.literal('fictionSetting'),
  fictionSettingId: nameFacetIdSchema,
})

const namingRecommendationReasonSubjectKindSchema = z.object({
  kind: z.literal('subjectKind'),
  subjectKind: nameSubjectKindSchema,
})

const namingRecommendationReasonTagSchema = z.object({
  kind: z.literal('tag'),
  tag: z.string().min(1),
})

export const namingRecommendationReasonSchema = z.discriminatedUnion('kind', [
  namingRecommendationReasonLanguageSchema,
  namingRecommendationReasonCultureSchema,
  namingRecommendationReasonSpeciesSchema,
  namingRecommendationReasonCreatureTypeSchema,
  namingRecommendationReasonRegionSchema,
  namingRecommendationReasonFictionSettingSchema,
  namingRecommendationReasonSubjectKindSchema,
  namingRecommendationReasonTagSchema,
])

export type NamingRecommendationReason = z.infer<typeof namingRecommendationReasonSchema>

export const namingRecommendationSchema = z.object({
  conventionId: z.string().min(1),
  score: z.number(),
  reasons: z.array(namingRecommendationReasonSchema),
})

export type NamingRecommendation = z.infer<typeof namingRecommendationSchema>
