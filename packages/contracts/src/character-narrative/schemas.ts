import { z } from 'zod'
import { alignmentSchema } from '../rpg/vocab/alignment'
import { characterTypeSchema } from '../rpg/runtime/character/sheet/core'
import { characterNarrativeSchema } from '../rpg/runtime/character/sheet/narrative'
import { organizationSchema } from '../rpg/content/organization/organization'
import { characterOrganizationConnectionSchema } from '../rpg/runtime/character/connections/connections'
import {
  NARRATIVE_TOKEN_PATTERN,
  narrativeFragmentConditionSchema,
  narrativeSlotSchema,
  narrativeThemeSchema,
  narrativeTokenSchema,
} from './vocabulary'
import {
  narrativeOrganizationFactSchema,
  narrativePersonFactSchema,
  narrativePlaceFactSchema,
  narrativeRelationshipFactsSchema,
  narrativeResidenceFactSchema,
  narrativeBindingProvenanceSchema,
  narrativePersonRoleSchema,
  narrativePlaceRoleSchema,
} from './relationship-facts'

export const narrativeOrganizationSchema = organizationSchema
  .pick({ id: true, name: true })
  .merge(characterOrganizationConnectionSchema.pick({ title: true }))
  .extend({ affinities: z.array(z.string()).default([]) })
export const narrativeResidenceSchema = narrativeResidenceFactSchema

export const narrativeGenerationContextSchema = z.object({
  alignment: alignmentSchema.optional(),
  characterKind: characterTypeSchema,
  level: z.number().int().nonnegative(),
  affinities: z.array(z.string()).default([]),
  tokens: z.partialRecord(narrativeTokenSchema, z.string().min(1)).default({}),
  organizations: z.array(narrativeOrganizationFactSchema).default([]),
  residences: z.array(narrativeResidenceFactSchema).default([]),
  people: z.array(narrativePersonFactSchema).default([]),
  places: z.array(narrativePlaceFactSchema).default([]),
  relationshipFacts: narrativeRelationshipFactsSchema.optional(),
  boundConditions: z.array(narrativeFragmentConditionSchema).default([]),
  omittedReferenceIds: z.array(z.string()).default([]),
})

export const narrativeFragmentSchema = z
  .object({
    id: z.string().min(1),
    slot: narrativeSlotSchema,
    text: z.string().min(1),
    alignmentIds: z.array(alignmentSchema).min(1).optional(),
    themeIds: z.array(narrativeThemeSchema).min(1),
    requires: z.array(narrativeTokenSchema).default([]),
    conditions: z.array(narrativeFragmentConditionSchema).default([]),
    affinities: z.array(z.string()).default([]),
    conflictTags: z.array(z.string()).default([]),
    weight: z.number().positive().default(1),
    fallback: z.boolean().default(false),
  })
  .superRefine((fragment, ctx) => {
    const tokens = [...fragment.text.matchAll(new RegExp(NARRATIVE_TOKEN_PATTERN))].map(
      (match) => match[1]!,
    )
    for (const token of tokens) {
      if (
        !narrativeTokenSchema.safeParse(token).success ||
        !fragment.requires.includes(token as z.infer<typeof narrativeTokenSchema>)
      ) {
        ctx.addIssue({ code: 'custom', message: `Undeclared or unknown token: ${token}` })
      }
    }
    if (fragment.text.replace(new RegExp(NARRATIVE_TOKEN_PATTERN), '').match(/[{}]/)) {
      ctx.addIssue({ code: 'custom', message: 'Malformed template token' })
    }
    if (
      fragment.fallback &&
      (fragment.requires.length || fragment.alignmentIds || fragment.conflictTags.length)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Fallback fragments must be unrestricted and reference-free',
      })
    }
  })
export const narrativeCollectionSchema = z
  .object({
    revision: z.string().min(1),
    fragments: z.array(narrativeFragmentSchema).min(1),
  })
  .superRefine((collection, ctx) => {
    const ids = collection.fragments.map(({ id }) => id)
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: 'custom', message: 'Duplicate fragment IDs' })
  })
export const narrativeRoleBindingSchema = z.object({
  targetId: z.string().min(1),
  provenance: narrativeBindingProvenanceSchema,
})

export const narrativePersonBindingSchema = narrativeRoleBindingSchema.extend({
  role: narrativePersonRoleSchema,
})

export const narrativePlaceBindingSchema = narrativeRoleBindingSchema.extend({
  role: narrativePlaceRoleSchema,
})

export const narrativeCompositionPlanSchema = z.object({
  theme: narrativeThemeSchema,
  organizationId: z.string().optional(),
  residenceId: z.string().optional(),
  organization: narrativeRoleBindingSchema.optional(),
  place: narrativePlaceBindingSchema.optional(),
  person: narrativePersonBindingSchema.optional(),
})
export const generatedNarrativeSchema = characterNarrativeSchema
  .omit({ backstory: true })
  .required()
  .extend({
    backstoryParagraphs: z.array(z.string().min(1)).length(3),
  })
export const narrativeGenerationResultSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    narrative: generatedNarrativeSchema,
    plan: narrativeCompositionPlanSchema,
    seed: z.number().int(),
    revision: z.string(),
    fragmentIds: z.array(z.string()),
    usedFallback: z.boolean(),
    omittedReferenceIds: z.array(z.string()),
    selectedBindings: z.array(narrativeBindingProvenanceSchema).default([]),
  }),
  z.object({ ok: z.literal(false), reason: z.string() }),
])
export type NarrativeGenerationContext = z.infer<typeof narrativeGenerationContextSchema>
export type NarrativeFragment = z.infer<typeof narrativeFragmentSchema>
export type NarrativeCollection = z.infer<typeof narrativeCollectionSchema>
export type NarrativeCompositionPlan = z.infer<typeof narrativeCompositionPlanSchema>
export type GeneratedNarrative = z.infer<typeof generatedNarrativeSchema>
export type NarrativeGenerationResult = z.infer<typeof narrativeGenerationResultSchema>
