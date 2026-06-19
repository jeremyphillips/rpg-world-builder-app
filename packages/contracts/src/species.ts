import { z } from 'zod'

import { abilitySchema } from './ability'
import { armorCategorySchema } from './armor'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './content'
import { creatureSizeSchema } from './creature-size'
import { creatureTypeSchema } from './creature-type'
import { damageTypeSchema } from './damage-type'
import { levelSchema } from './level'
import { skillSchema } from './skill-proficiency'

// ---------------------------------------------------------------------------
// Species — a playable people/ancestry. Modeled like `class.ts`: SRD-faithful
// prose lives in rich-text trait descriptions (HTML strings), while the few
// mechanical bits a character builder needs are kept structured in a reusable
// `grants` bag. There is no rules engine: `grants` is data the builder reads,
// not behavior. Lineages/ancestries are embedded `choiceGroups` (one record per
// species), not a separate content type.
// ---------------------------------------------------------------------------

// --- Senses ----------------------------------------------------------------

export const SENSE_TYPES = ['darkvision', 'blindsight', 'tremorsense', 'truesight'] as const

export const senseTypeSchema = z.enum(SENSE_TYPES)

export type SenseType = (typeof SENSE_TYPES)[number]

export const SENSE_LABELS: Record<SenseType, string> = {
  darkvision: 'Darkvision',
  blindsight: 'Blindsight',
  tremorsense: 'Tremorsense',
  truesight: 'Truesight',
}

/** Returns the display label for a sense type. Falls back to the raw value. */
export function getSenseLabel(type: string): string {
  return SENSE_LABELS[type as SenseType] ?? type
}

/** A special sense and its range in feet (e.g. Darkvision 60 ft). */
export const senseSchema = z.object({
  type: senseTypeSchema,
  range: z.number().int().min(0),
})

export type Sense = z.infer<typeof senseSchema>

// --- Speed -----------------------------------------------------------------

/**
 * Movement speeds in feet. `walk` is always present; the other modes appear
 * only when a species has them. Reused (as a partial) for lineage overrides.
 */
export const speedSchema = z.object({
  walk: z.number().int().min(0),
  fly: z.number().int().min(0).optional(),
  swim: z.number().int().min(0).optional(),
  climb: z.number().int().min(0).optional(),
  burrow: z.number().int().min(0).optional(),
})

export type Speed = z.infer<typeof speedSchema>

// --- Innate spellcasting ----------------------------------------------------

/** How often a granted spell can be cast for free. */
export const SPELL_FREQUENCIES = [
  'at_will',
  'prof_bonus_per_long_rest',
  'once_per_long_rest',
] as const

export const spellFrequencySchema = z.enum(SPELL_FREQUENCIES)

export type SpellFrequency = (typeof SPELL_FREQUENCIES)[number]

/**
 * Spells gained at a character level. `spellIds` are opaque spell slugs for now
 * (no Spell content type yet); wire to real references when spells land. Player
 * *choices* (e.g. "choose one Wizard cantrip") are intentionally NOT modeled
 * here — that prose stays in the trait's rich-text description.
 */
export const innateSpellEntrySchema = z.object({
  level: levelSchema,
  spellIds: z.array(z.string().min(1)).min(1),
  frequency: spellFrequencySchema.optional(),
})

export const innateSpellsSchema = z.object({
  ability: abilitySchema,
  entries: z.array(innateSpellEntrySchema).min(1),
})

export type InnateSpells = z.infer<typeof innateSpellsSchema>

// --- Proficiencies ----------------------------------------------------------

/** Proficiencies a trait or lineage option grants. All optional. */
export const speciesProficienciesSchema = z.object({
  skills: z.array(skillSchema).optional(),
  tools: z.array(z.string()).optional(),
  weapons: z.array(z.string()).optional(),
  armor: z.array(armorCategorySchema).optional(),
})

export type SpeciesProficiencies = z.infer<typeof speciesProficienciesSchema>

// --- Grants -----------------------------------------------------------------

/**
 * The structured, character-builder-facing payload a trait or lineage option
 * confers. Every field is optional; a purely flavorful trait omits `grants`
 * entirely and carries only its rich-text description.
 */
export const speciesGrantsSchema = z.object({
  senses: z.array(senseSchema).optional(),
  /** Replaces or adds movement modes (e.g. Wood Elf walk 35). Partial of `speedSchema`. */
  speedOverride: speedSchema.partial().optional(),
  /** Chosen damage type(s), e.g. a Dragonborn's breath or a Goliath's ancestry. */
  damageType: z.array(damageTypeSchema).optional(),
  resistances: z.array(damageTypeSchema).optional(),
  proficiencies: speciesProficienciesSchema.optional(),
  languages: z.array(z.string()).optional(),
  innateSpells: innateSpellsSchema.optional(),
})

export type SpeciesGrants = z.infer<typeof speciesGrantsSchema>

// --- Traits + choice groups -------------------------------------------------

/**
 * The universal building block: SRD-worded rich text plus optional structured
 * grants. Used both for a species' fixed traits and for each option inside a
 * lineage/ancestry choice group.
 */
export const speciesTraitSchema = z.object({
  id: z.string().min(1), // unique within the species — enforced at the service layer
  name: z.string().min(1),
  /** Rich-text HTML faithful to the SRD wording. */
  description: z.string().optional(),
  grants: speciesGrantsSchema.optional(),
})

export type SpeciesTrait = z.infer<typeof speciesTraitSchema>

/** The kinds of level-1 choice a species can present. */
export const SPECIES_CHOICE_KINDS = ['lineage', 'ancestry'] as const

export const speciesChoiceKindSchema = z.enum(SPECIES_CHOICE_KINDS)

export type SpeciesChoiceKind = (typeof SPECIES_CHOICE_KINDS)[number]

export const SPECIES_CHOICE_KIND_LABELS: Record<SpeciesChoiceKind, string> = {
  lineage: 'Lineage',
  ancestry: 'Ancestry',
}

/** Returns the display label for a choice-group kind. Falls back to the raw value. */
export function getSpeciesChoiceKindLabel(kind: string): string {
  return SPECIES_CHOICE_KIND_LABELS[kind as SpeciesChoiceKind] ?? kind
}

/**
 * A player choice made at character creation (e.g. Elven Lineage, Draconic
 * Ancestry). Each option is a trait — prose plus the grants that option confers.
 */
export const speciesChoiceGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: speciesChoiceKindSchema,
  description: z.string().optional(),
  options: z.array(speciesTraitSchema).min(1),
})

export type SpeciesChoiceGroup = z.infer<typeof speciesChoiceGroupSchema>

// --- Species — editable body + stored shape ---------------------------------

/** The editable shape: what a form authors and what a patch overrides. */
export const speciesBodySchema = contentBodyBaseSchema.extend({
  creatureType: creatureTypeSchema,
  /** Allowed sizes; a single-element array is a fixed size, multiple is a choice. */
  sizes: z.array(creatureSizeSchema).min(1),
  speed: speedSchema,
  traits: z.array(speciesTraitSchema),
  choiceGroups: z.array(speciesChoiceGroupSchema).optional(),
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
