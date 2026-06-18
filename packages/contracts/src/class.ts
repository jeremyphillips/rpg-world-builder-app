import { z } from 'zod'
import { abilitySchema } from './ability'
import { hitDieSchema } from './dice'
import { levelSchema } from './level'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './content'
import { weaponCategorySchema } from './weapon'
import { armorCategorySchema } from './armor'
import { skillSchema } from './skill'

// ---------------------------------------------------------------------------
// Spellcasting
// ---------------------------------------------------------------------------

export const SPELLCASTING_PROGRESSIONS = ['full', 'half', 'pact'] as const
export type SpellcastingProgression = (typeof SPELLCASTING_PROGRESSIONS)[number]

export const SPELL_PREPARATION = ['prepared', 'known'] as const

/**
 * Cantrips known is tabular data, not a closed taxonomy, so the schema stores an
 * inline, self-contained progression. This stays open to homebrew/patches:
 * authoring a class just means editing the array (no closed enum, no shared
 * registry, no id collisions). Heuristic: `z.enum` for mechanics the engine
 * branches on; inline data for lookup tables like this one.
 */
export const cantripsKnownEntrySchema = z.object({
  level: levelSchema,
  known: z.number().int().min(0),
})

export const cantripsProgressionSchema = z.array(cantripsKnownEntrySchema)

export const spellcastingSchema = z.object({
  progression: z.enum(SPELLCASTING_PROGRESSIONS),
  ability: abilitySchema,
  preparation: z.enum(SPELL_PREPARATION),
  cantrips: cantripsProgressionSchema.optional(),
})

export type Spellcasting = z.infer<typeof spellcastingSchema>

// ---------------------------------------------------------------------------
// Class features + proficiencies
// ---------------------------------------------------------------------------

export const classFeatureSchema = z.object({
  id: z.string().min(1), // unique within the class — enforced at the service layer
  name: z.string().min(1),
  level: levelSchema,
  description: z.string().optional(),
})

export type ClassFeature = z.infer<typeof classFeatureSchema>

export const classProficienciesSchema = z.object({
  savingThrows: z.array(abilitySchema).min(1).max(3), // relaxed for homebrew (SRD uses 2)
  armor: z.array(armorCategorySchema),
  weapons: z.object({
    categories: z.array(weaponCategorySchema),
    items: z.array(z.string()).optional(), // weapon ids (future weapon content)
  }),
  tools: z.array(z.string()).optional(),
  skills: z.object({
    choose: z.number().int().min(0),
    from: z.array(skillSchema),
  }),
})

export type ClassProficiencies = z.infer<typeof classProficienciesSchema>

// ---------------------------------------------------------------------------
// Class — editable body + stored shape
// ---------------------------------------------------------------------------

/** The editable shape: what a form authors and what a patch overrides. */
export const classBodySchema = contentBodyBaseSchema.extend({
  primaryAbilities: z.array(abilitySchema).min(1),
  hitDie: hitDieSchema,
  asiLevels: z.array(levelSchema),
  subclassLevels: z.array(levelSchema).min(1), // relaxed for homebrew (SRD = single level)
  spellcasting: spellcastingSchema.optional(),
  proficiencies: classProficienciesSchema,
  features: z.array(classFeatureSchema),
})

export type ClassBody = z.infer<typeof classBodySchema>

/** Stored shape = ownership envelope + body. */
export const classSchema = contentMetaSchema.extend(classBodySchema.shape)
export type CharacterClass = z.infer<typeof classSchema>

// Homebrew authoring DTOs (forms). Server sets id/source/campaignId/timestamps.
export const createClassInputSchema = classBodySchema.extend({ slug: slugSchema })
export type CreateClassInput = z.infer<typeof createClassInputSchema>

export const updateClassInputSchema = createClassInputSchema.partial()
export type UpdateClassInput = z.infer<typeof updateClassInputSchema>

/**
 * System-patch overlay. Reuses the generic envelope; only the type-specific
 * `patch` body differs. `.partial()` is shallow (Zod v4 has no `deepPartial`);
 * the read-time merge does the deep-merge, replacing arrays wholesale (see the
 * Deferred block).
 */
export const classPatchSchema = contentPatchBaseSchema.extend({
  patch: classBodySchema.partial(),
})
export type ClassPatch = z.infer<typeof classPatchSchema>

// ---------------------------------------------------------------------------
// Subclass — references its parent class by the opaque `id` (not slug)
// ---------------------------------------------------------------------------

export const subclassBodySchema = contentBodyBaseSchema.extend({
  classId: z.string().min(1),
  /** Short italic lead-in matching the SRD's em-formatted tagline (e.g. "Channel Rage into Violent Fury"). */
  tagline: z.string().optional(),
})

export type SubclassBody = z.infer<typeof subclassBodySchema>

export const subclassSchema = contentMetaSchema.extend(subclassBodySchema.shape)
export type Subclass = z.infer<typeof subclassSchema>

export const createSubclassInputSchema = subclassBodySchema.extend({ slug: slugSchema })
export type CreateSubclassInput = z.infer<typeof createSubclassInputSchema>

export const updateSubclassInputSchema = createSubclassInputSchema.partial()
export type UpdateSubclassInput = z.infer<typeof updateSubclassInputSchema>

// ---------------------------------------------------------------------------
// Deferred — documented intentionally, not built in this phase:
//
// - extraAttacks: [{ level, attacks }] — structured Extra Attack progression
//   (Fighter 5/11/20). For now Extra Attack is a `features[]` row only.
// - Subclass features + the feature effects engine
//   (formula/condition/modifier/aura).
// - Warlock mysticArcanum; spell-slot / spells-known tables.
// - Skill governing-ability and full weapon/armor/skill content types (built in
//   their feature folders; schemas added to their contract modules).
// - Merge granularity for overlay patches: the read-time merge deep-merges
//   objects but replaces arrays wholesale (override `features`/`asiLevels`
//   entirely, not element-wise). Per-element array patching is deferred.
// - CANTRIPS_KNOWN_PROFILES: a seed-only authoring helper (NOT in the contract)
//   that expands shared SRD cantrip curves into the inline `cantrips` table.
// ---------------------------------------------------------------------------
