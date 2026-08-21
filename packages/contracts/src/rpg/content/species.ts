import { z } from 'zod'

import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './lib/envelope'
import { creatureSizeSchema } from '../vocab/creature-size'
import { creatureTypeSchema } from '../vocab/creature-type'
import { movementSpeedsDraftSchema, movementSpeedsSchema } from '../vocab/movement-mode'
import { contentNamedChoiceSchema } from './lib/grants/choice'
import {
  contentTraitSchema,
  contentGrantSchema,
  grantUnlockSchema,
  grantGroupSchema,
  grantGroupsSchema,
} from './lib/grants'
import { languageIdSchema } from '../vocab/language'
import { speciesCharacterCreationSchema } from './species-character-creation'
import { speciesCultureConfigSchema } from './species-culture'
import { SPECIES_CONTENT_TYPE_TERM } from './lib/content-type-terms'
import { createDraftInputSchema, draftStoredSchema } from './lib/content-input-schemas'
import { draftAuthoredContentBodySchema } from './lib/draft-authored-content'

// ---------------------------------------------------------------------------
// Species — a playable people/ancestry. SRD-faithful prose lives in rich-text
// trait descriptions (HTML strings), while mechanical bits live in shared
// `grants`. Lineages/ancestries are embedded as optional `heritage` on the
// species body, not a separate content type.
// ---------------------------------------------------------------------------

// Re-export shared grant types for species authoring.
export {
  contentTraitSchema,
  contentGrantSchema,
  grantUnlockSchema,
  grantGroupSchema,
  grantGroupsSchema,
}
export type { ContentTrait, ContentGrant, GrantUnlock, GrantGroup, GrantGroups } from './lib/grants'

export type SpeciesTrait = z.infer<typeof contentTraitSchema>

/**
 * A player choice made at character creation (e.g. Elven Lineage, Draconic
 * Ancestry). Each option is a trait — prose plus the grants that option confers.
 * Wording like "lineage" vs "ancestry" lives in `name`, not a separate field.
 */
export const speciesHeritageSchema = contentNamedChoiceSchema.extend({
  options: z.array(contentTraitSchema).min(1),
})

export type SpeciesHeritage = z.infer<typeof speciesHeritageSchema>

/** Draft heritage — options may be empty while authoring. */
export const speciesHeritageDraftSchema = contentNamedChoiceSchema.omit({ options: true }).extend({
  options: z.array(contentTraitSchema).default([]),
})

export type SpeciesHeritageDraft = z.infer<typeof speciesHeritageDraftSchema>

// --- Species — editable body + stored shape ---------------------------------

/** The editable shape: what a form authors and what a patch overrides. */
export const speciesBodySchema = contentBodyBaseSchema.extend({
  creatureType: creatureTypeSchema,
  /** Allowed sizes; a single-element array is a fixed size, multiple is a choice. */
  sizes: z.array(creatureSizeSchema).min(1),
  movement: movementSpeedsSchema,
  /**
   * Recommended language ids for origin picks. Marks selectable ChoiceSet options
   * as recommended in the UI; does not grant languages or expand selectable pools.
   */
  languageAffinities: z.array(languageIdSchema).optional(),
  /** Cultural affiliation and naming capability for generator integration. */
  culture: speciesCultureConfigSchema.optional(),
  traits: z.array(contentTraitSchema),
  heritage: speciesHeritageSchema.optional(),
  /** Species-authored data consumed only when the campaign enables the matching rule. */
  characterCreation: speciesCharacterCreationSchema.optional(),
})

export type SpeciesBody = z.infer<typeof speciesBodySchema>

/** Draft save body — untitled name fallback; sizes/movement/heritage relaxed. */
export const speciesBodyDraftSchema = draftAuthoredContentBodySchema(
  SPECIES_CONTENT_TYPE_TERM.label,
).extend({
  creatureType: creatureTypeSchema,
  sizes: z.array(creatureSizeSchema).default([]),
  movement: movementSpeedsDraftSchema,
  languageAffinities: z.array(languageIdSchema).optional(),
  culture: speciesCultureConfigSchema.optional(),
  traits: z.array(contentTraitSchema).default([]),
  heritage: speciesHeritageDraftSchema.optional(),
  characterCreation: speciesCharacterCreationSchema.optional(),
})

export type SpeciesBodyDraft = z.infer<typeof speciesBodyDraftSchema>

/** Stored shape = ownership envelope + body. */
export const speciesSchema = contentMetaSchema.extend(speciesBodySchema.shape)
export type Species = z.infer<typeof speciesSchema>

/** Stored draft shape — relaxed body fields for in-progress homebrew. */
export const speciesDraftStoredSchema = draftStoredSchema(speciesBodyDraftSchema)
export type SpeciesDraft = z.infer<typeof speciesDraftStoredSchema>

// Homebrew authoring DTOs (forms). Server sets id/source/campaignId/timestamps.
export const createSpeciesInputSchema = speciesBodySchema.extend({ slug: slugSchema })
export type CreateSpeciesInput = z.infer<typeof createSpeciesInputSchema>

export const createSpeciesDraftInputSchema = createDraftInputSchema(speciesBodyDraftSchema)
export type CreateSpeciesDraftInput = z.infer<typeof createSpeciesDraftInputSchema>

export const updateSpeciesInputSchema = createSpeciesInputSchema.partial()
export type UpdateSpeciesInput = z.infer<typeof updateSpeciesInputSchema>

export const updateSpeciesDraftInputSchema = createSpeciesDraftInputSchema.partial()
export type UpdateSpeciesDraftInput = z.infer<typeof updateSpeciesDraftInputSchema>

/**
 * System-patch overlay. Reuses the generic envelope; only the type-specific
 * `patch` body differs. `.partial()` is shallow; the read-time merge handles
 * deep-merging (arrays replaced wholesale).
 */
export const speciesPatchSchema = contentPatchBaseSchema.extend({
  patch: speciesBodySchema.partial(),
})
export type SpeciesPatch = z.infer<typeof speciesPatchSchema>
