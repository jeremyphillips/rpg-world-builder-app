import { z } from 'zod'

import { abilitySchema } from '../vocab/ability'
import { armorCategorySchema } from '../vocab/armor/category'
import { damageTypeSchema } from '../vocab/damage-type'
import { levelSchema } from '../primitives/level'
import { speedSchema } from '../vocab/movement-mode'
import { senseSchema } from '../vocab/sense'
import { usageFrequencySchema } from '../vocab/usage-frequency'
import { skillSchema } from './skill-proficiency'

// ---------------------------------------------------------------------------
// Content grants — shared mechanical payload for species traits, class features,
// subclass features, and (future) feats. Optional fields only; no rules engine.
// Player choices (e.g. "choose two skills") stay in rich-text descriptions.
// ---------------------------------------------------------------------------

// --- Innate spellcasting ----------------------------------------------------

export const INNATE_SPELL_KINDS = ['free_cast', 'always_prepared'] as const

export const innateSpellKindSchema = z.enum(INNATE_SPELL_KINDS)

export type InnateSpellKind = z.infer<typeof innateSpellKindSchema>

/**
 * Spells gained at a character level. `spellIds` are opaque spell slugs for now
 * (no Spell content type yet); wire to real references when spells land.
 *
 * - `free_cast` — slotless casting cadence via `frequency` (species lineage pattern).
 * - `always_prepared` — always on the prepared list; cast with normal slots when used.
 */
const innateSpellEntryBaseSchema = z.object({
  level: levelSchema,
  spellIds: z.array(z.string().min(1)).min(1),
  kind: innateSpellKindSchema.default('free_cast'),
  frequency: usageFrequencySchema.optional(),
})

export const innateSpellEntrySchema = innateSpellEntryBaseSchema.superRefine((val, ctx) => {
  if (val.kind === 'always_prepared' && val.frequency !== undefined) {
    ctx.addIssue({
      code: 'custom',
      message: 'frequency is not allowed when kind is always_prepared',
      path: ['frequency'],
    })
  }
})

export type InnateSpellEntry = z.infer<typeof innateSpellEntrySchema>

export const innateSpellsSchema = z.object({
  ability: abilitySchema,
  entries: z.array(innateSpellEntrySchema).min(1),
})

export type InnateSpells = z.infer<typeof innateSpellsSchema>

// --- Proficiencies ----------------------------------------------------------

/** Proficiencies a trait or feature grants. All optional; fixed lists only. */
export const contentProficienciesSchema = z.object({
  skills: z.array(skillSchema).optional(),
  tools: z.array(z.string()).optional(),
  weapons: z.array(z.string()).optional(),
  armor: z.array(armorCategorySchema).optional(),
})

export type ContentProficiencies = z.infer<typeof contentProficienciesSchema>

// --- Grants -----------------------------------------------------------------

/**
 * Structured, character-builder-facing payload. Every field is optional; purely
 * flavorful content omits `grants` and carries only rich-text description.
 */
export const contentGrantsSchema = z.object({
  senses: z.array(senseSchema).optional(),
  /** Replaces or adds movement modes (e.g. Wood Elf walk 35). Partial of `speedSchema`. */
  speedOverride: speedSchema.partial().optional(),
  /** Chosen damage type(s), e.g. a Dragonborn's breath or a Goliath's ancestry. */
  damageType: z.array(damageTypeSchema).optional(),
  resistances: z.array(damageTypeSchema).optional(),
  proficiencies: contentProficienciesSchema.optional(),
  languages: z.array(z.string()).optional(),
  innateSpells: innateSpellsSchema.optional(),
})

export type ContentGrants = z.infer<typeof contentGrantsSchema>

// --- Trait building block ---------------------------------------------------

/**
 * Universal building block: SRD-worded rich text plus optional structured grants.
 * Extended with `level` for class/subclass features; used as-is for species traits.
 */
export const contentTraitSchema = z.object({
  id: z.string().min(1), // unique within the parent record — enforced at the service layer
  name: z.string().min(1),
  /** Rich-text HTML faithful to the SRD wording (body only — no "Level N:" prefix). */
  description: z.string().optional(),
  grants: contentGrantsSchema.optional(),
})

export type ContentTrait = z.infer<typeof contentTraitSchema>

// --- Backward-compatible aliases (species module re-exports these too) ------

/** @deprecated Prefer `contentProficienciesSchema`. */
export const speciesProficienciesSchema = contentProficienciesSchema
export type SpeciesProficiencies = ContentProficiencies

/** @deprecated Prefer `contentGrantsSchema`. */
export const speciesGrantsSchema = contentGrantsSchema
export type SpeciesGrants = ContentGrants
