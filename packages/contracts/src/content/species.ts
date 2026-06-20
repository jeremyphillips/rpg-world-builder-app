import { z } from 'zod'

import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './envelope'
import { creatureSizeSchema } from '../vocab/creature-size'
import { creatureTypeSchema } from '../vocab/creature-type'
import { speedSchema } from '../vocab/movement-mode'
import {
  contentGrantsSchema,
  contentTraitSchema,
  innateSpellEntrySchema,
  innateSpellsSchema,
  speciesGrantsSchema,
  speciesProficienciesSchema,
} from './grants'

// ---------------------------------------------------------------------------
// Species — a playable people/ancestry. SRD-faithful prose lives in rich-text
// trait descriptions (HTML strings), while mechanical bits live in shared
// `grants`. Lineages/ancestries are embedded `heritageChoices` (one record per
// species), not a separate content type.
// ---------------------------------------------------------------------------

// Re-export shared grant types for backward compatibility.
export {
  contentGrantsSchema,
  contentTraitSchema,
  innateSpellEntrySchema,
  innateSpellsSchema,
  speciesGrantsSchema,
  speciesProficienciesSchema,
}
export type {
  ContentGrants,
  ContentTrait,
  InnateSpellEntry,
  InnateSpells,
  InnateSpellKind,
  SpeciesGrants,
  SpeciesProficiencies,
} from './grants'

/** @deprecated Prefer `contentTraitSchema`. */
export const speciesTraitSchema = contentTraitSchema
export type SpeciesTrait = z.infer<typeof contentTraitSchema>

/** The kinds of level-1 choice a species can present. */
export const SPECIES_CHOICE_KINDS = ['lineage', 'ancestry'] as const

export const speciesChoiceKindSchema = z.enum(SPECIES_CHOICE_KINDS)

export type SpeciesChoiceKind = (typeof SPECIES_CHOICE_KINDS)[number]

export const SPECIES_CHOICE_KIND_LABELS: Record<SpeciesChoiceKind, string> = {
  lineage: 'Lineage',
  ancestry: 'Ancestry',
}

/** Returns the display label for a heritage-choice kind. Falls back to the raw value. */
export function getSpeciesChoiceKindLabel(kind: string): string {
  return SPECIES_CHOICE_KIND_LABELS[kind as SpeciesChoiceKind] ?? kind
}

/**
 * A player choice made at character creation (e.g. Elven Lineage, Draconic
 * Ancestry). Each option is a trait — prose plus the grants that option confers.
 */
export const speciesHeritageChoiceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: speciesChoiceKindSchema,
  description: z.string().optional(),
  options: z.array(speciesTraitSchema).min(1),
})

export type SpeciesHeritageChoice = z.infer<typeof speciesHeritageChoiceSchema>

// --- Species — editable body + stored shape ---------------------------------

/** The editable shape: what a form authors and what a patch overrides. */
export const speciesBodySchema = contentBodyBaseSchema.extend({
  creatureType: creatureTypeSchema,
  /** Allowed sizes; a single-element array is a fixed size, multiple is a choice. */
  sizes: z.array(creatureSizeSchema).min(1),
  speed: speedSchema,
  traits: z.array(speciesTraitSchema),
  heritageChoices: z.array(speciesHeritageChoiceSchema).optional(),
})

export type SpeciesBody = z.infer<typeof speciesBodySchema>

/** Stored shape = ownership envelope + body. */
export const speciesSchema = contentMetaSchema.extend(speciesBodySchema.shape)
export type Species = z.infer<typeof speciesSchema>

// Homebrew authoring DTOs (forms). Server sets id/source/campaignId/timestamps.
export const createSpeciesInputSchema = speciesBodySchema.extend({ slug: slugSchema })
export type CreateSpeciesInput = z.infer<typeof createSpeciesInputSchema>

export const updateSpeciesInputSchema = createSpeciesInputSchema.partial()
export type UpdateSpeciesInput = z.infer<typeof updateSpeciesInputSchema>

/**
 * System-patch overlay. Reuses the generic envelope; only the type-specific
 * `patch` body differs. `.partial()` is shallow; the read-time merge handles
 * deep-merging (arrays replaced wholesale).
 */
export const speciesPatchSchema = contentPatchBaseSchema.extend({
  patch: speciesBodySchema.partial(),
})
export type SpeciesPatch = z.infer<typeof speciesPatchSchema>
