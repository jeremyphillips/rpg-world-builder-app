import { z } from 'zod'

import { characterRelationshipLifecycleSchema } from '../rpg/vocab/character-relationship/lifecycle'

export const narrativeBindingProvenanceSchema = z.discriminatedUnion('source', [
  z.object({
    source: z.literal('draft'),
    draftEdgeId: z.string().min(1),
  }),
  z.object({
    source: z.literal('persisted'),
    relationshipId: z.string().min(1),
    revision: z.number().int().nonnegative(),
  }),
])

export type NarrativeBindingProvenance = z.infer<typeof narrativeBindingProvenanceSchema>

export const narrativePersonRoleSchema = z.enum(['mentor', 'child', 'partner', 'rival', 'parent'])

export type NarrativePersonRole = z.infer<typeof narrativePersonRoleSchema>

export const narrativePlaceRoleSchema = z.enum(['hometown', 'residence', 'birthplace', 'property'])

export type NarrativePlaceRole = z.infer<typeof narrativePlaceRoleSchema>

const narrativeFactBaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  affinities: z.array(z.string()).default([]),
  provenance: narrativeBindingProvenanceSchema,
})

export const narrativePersonFactSchema = narrativeFactBaseSchema.extend({
  role: narrativePersonRoleSchema,
  lifecycle: characterRelationshipLifecycleSchema.optional(),
})

export type NarrativePersonFact = z.infer<typeof narrativePersonFactSchema>

export const narrativePlaceFactSchema = narrativeFactBaseSchema.extend({
  role: narrativePlaceRoleSchema,
  lifecycle: characterRelationshipLifecycleSchema.optional(),
})

export type NarrativePlaceFact = z.infer<typeof narrativePlaceFactSchema>

export const narrativeOrganizationFactSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  title: z.string().min(1).optional(),
  lifecycle: characterRelationshipLifecycleSchema.default('current'),
  affinities: z.array(z.string()).default([]),
  provenance: narrativeBindingProvenanceSchema,
})

export type NarrativeOrganizationFact = z.infer<typeof narrativeOrganizationFactSchema>

export const narrativeResidenceFactSchema = narrativePlaceFactSchema.extend({
  role: z.literal('residence'),
})

export type NarrativeResidenceFact = z.infer<typeof narrativeResidenceFactSchema>

export const narrativeRelationshipFactsSchema = z.object({
  organizations: z.array(narrativeOrganizationFactSchema).default([]),
  residences: z.array(narrativeResidenceFactSchema).default([]),
  people: z.array(narrativePersonFactSchema).default([]),
  places: z.array(narrativePlaceFactSchema).default([]),
})

export type NarrativeRelationshipFacts = z.infer<typeof narrativeRelationshipFactsSchema>
