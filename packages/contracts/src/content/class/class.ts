import { z } from 'zod'

import { abilitySchema } from '../../vocab/ability'
import { armorCategorySchema } from '../../vocab/armor/category'
import { weaponCategorySchema } from '../../vocab/weapon/category'
import { hitDieSchema } from '../../primitives/dice'
import { absoluteLevelSchema } from '../../primitives/level'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from '../lib/envelope'
import { customContentTraitSchema, normalizeContentTrait } from '../lib/grants'
import { toolCategorySchema } from '../../vocab/equipment/tool-category'
import { skillSchema } from '../skill-proficiency'

import { classCharacterCreationSchema } from '../starting-equipment'
import { spellcastingSchema } from './spellcasting'

// ---------------------------------------------------------------------------
// Class — SRD-faithful prose lives in rich-text HTML on `description` and
// `features[].description`; structured fields (proficiencies, spellcasting, etc.)
// are data the character builder reads, not a rules engine.
// ---------------------------------------------------------------------------

// --- Class features + proficiencies ----------------------------------------

export const classFeatureSchema = z.preprocess(
  normalizeContentTrait,
  customContentTraitSchema.extend({
    level: absoluteLevelSchema,
  }),
)

export type ClassFeature = z.infer<typeof classFeatureSchema>

/** Subclass features share the class feature shape (level + optional grants). */
export const subclassFeatureSchema = classFeatureSchema

export type SubclassFeature = z.infer<typeof subclassFeatureSchema>

/** Persisted / write surface — `from` is not stored; API derives it at read time. */
export const classSkillProficienciesWriteSchema = z
  .object({
    choose: z.number().int().min(0),
  })
  .strict()

export type ClassSkillProficienciesWrite = z.infer<typeof classSkillProficienciesWriteSchema>

/** Read surface — `from` is derived from `skill.suggestedClasses` (see skill-class-association). */
export const classSkillProficienciesReadSchema = classSkillProficienciesWriteSchema.extend({
  from: z.array(skillSchema),
})

export type ClassSkillProficienciesRead = z.infer<typeof classSkillProficienciesReadSchema>

export const classProficienciesWriteSchema = z.object({
  savingThrows: z.array(abilitySchema).min(1).max(3), // relaxed for homebrew (SRD uses 2)
  armor: z.array(armorCategorySchema),
  weapons: z.object({
    categories: z.array(weaponCategorySchema),
    items: z.array(z.string()).optional(), // weapon ids (future weapon content)
  }),
  tools: z
    .object({
      categories: z.array(toolCategorySchema),
      items: z.array(z.string()).optional(),
    })
    .optional(),
  skills: classSkillProficienciesWriteSchema,
})

export type ClassProficienciesWrite = z.infer<typeof classProficienciesWriteSchema>

/** Read model for class proficiencies (includes derived skill options). */
export const classProficienciesSchema = classProficienciesWriteSchema.extend({
  skills: classSkillProficienciesReadSchema,
})

export type ClassProficiencies = z.infer<typeof classProficienciesSchema>

// ---------------------------------------------------------------------------
// Class resources — generic per-level numeric progression
// (Sorcery Points, Rage count, Ki Points, Channel Divinity uses, etc.)
// ---------------------------------------------------------------------------

export const classResourceEntrySchema = z.object({
  level: absoluteLevelSchema,
  value: z.number().int().min(0),
})

export const classResourceSchema = z.object({
  /** Display name shown as a column header: "Sorcery Points", "Rage", etc. */
  name: z.string().min(1),
  entries: z.array(classResourceEntrySchema).min(1),
})

export type ClassResource = z.infer<typeof classResourceSchema>

// ---------------------------------------------------------------------------
// Class — editable body + stored shape
// ---------------------------------------------------------------------------

/** Persisted body — seed, homebrew Mongo, and overlay patches (no derived `skills.from`). */
export const classStoredBodySchema = contentBodyBaseSchema.extend({
  primaryAbilities: z.array(abilitySchema).min(1),
  hitDie: hitDieSchema,
  /** Level at which a character chooses their subclass; omit when the class has none. */
  subclassChoiceLevel: absoluteLevelSchema.optional(),
  spellcasting: spellcastingSchema.optional(),
  proficiencies: classProficienciesWriteSchema,
  features: z.array(classFeatureSchema),
  resources: z.array(classResourceSchema).optional(),
  characterCreation: classCharacterCreationSchema.optional(),
})

export type ClassStoredBody = z.infer<typeof classStoredBodySchema>

/** Read body — API responses and dashboard catalog picks (derived `skills.from`). */
export const classBodySchema = classStoredBodySchema.extend({
  proficiencies: classProficienciesSchema,
})

export type ClassBody = z.infer<typeof classBodySchema>

/** Display label for the subclass choice milestone on class progression tables. */
export function subclassChoiceFeatureLabel(className: string): string {
  return `${className} Subclass`
}

/** Stored record = envelope + persisted body (seed JSON, Mongo, patch merge target). */
export const classStoredSchema = contentMetaSchema.extend(classStoredBodySchema.shape)
export type ClassStored = z.infer<typeof classStoredSchema>

/** Read record = envelope + read body (`proficiencies.skills.from` is API-derived). */
export const classSchema = contentMetaSchema.extend(classBodySchema.shape)
export type CharacterClass = z.infer<typeof classSchema>

// Homebrew authoring DTOs (forms). Server sets id/source/campaignId/timestamps.
export const createClassInputSchema = classStoredBodySchema.extend({ slug: slugSchema })
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
  patch: classStoredBodySchema.partial(),
})
export type ClassPatch = z.infer<typeof classPatchSchema>

// ---------------------------------------------------------------------------
// Subclass — references its parent class by the opaque `id` (not slug).
// `description` (from contentBodyBaseSchema) is rich-text HTML; `tagline` is
// plain italic lead-in copy.
// ---------------------------------------------------------------------------

export const subclassPatchableBodySchema = contentBodyBaseSchema.extend({
  classId: z.string().min(1),
  /** Short italic lead-in matching the SRD's em-formatted tagline (e.g. "Channel Rage into Violent Fury"). */
  tagline: z.string().optional(),
  /** Optional on patch/update payloads; full records default to `[]` via `subclassBodySchema`. */
  features: z.array(subclassFeatureSchema).optional(),
})

/** The editable shape: what a form authors and what a patch overrides. */
export const subclassBodySchema = subclassPatchableBodySchema.extend({
  features: z.array(subclassFeatureSchema).default([]),
})

export type SubclassBody = z.infer<typeof subclassBodySchema>

export const subclassSchema = contentMetaSchema.extend(subclassBodySchema.shape)
export type Subclass = z.infer<typeof subclassSchema>

export const createSubclassInputSchema = subclassBodySchema.extend({ slug: slugSchema })
export type CreateSubclassInput = z.infer<typeof createSubclassInputSchema>

export const updateSubclassInputSchema = subclassPatchableBodySchema
  .extend({ slug: slugSchema })
  .partial()
export type UpdateSubclassInput = z.infer<typeof updateSubclassInputSchema>

/**
 * System-patch overlay for subclass body fields. Deep-merge semantics match
 * `classPatchSchema` — arrays replace wholesale at read time.
 */
export const subclassPatchSchema = contentPatchBaseSchema.extend({
  patch: subclassPatchableBodySchema.partial(),
})
export type SubclassPatch = z.infer<typeof subclassPatchSchema>

/**
 * Campaign-scoped availability for a subclass record. Separate from body patches:
 * deactivating hides the subclass in one campaign without deleting the record.
 */
export const subclassCampaignAvailabilitySchema = z.object({
  campaignId: z.string().min(1),
  targetId: z.string().min(1),
  activeInCampaign: z.boolean(),
})
export type SubclassCampaignAvailability = z.infer<typeof subclassCampaignAvailabilitySchema>

// ---------------------------------------------------------------------------
// Class taxonomy — SRD 5.2 class slugs -> display names, mirroring the SKILLS
// and ABILITY_ENTRIES maps. Used for name lookup (e.g. rendering `suggestedClasses`
// on skill proficiency detail pages). Homebrew classes are not enumerated here;
// `getClassName` falls back to the raw slug for unknown values.
// ---------------------------------------------------------------------------

/**
 * SRD 5.2 class slug -> display name. Doubles as form select options
 * (`value: slug`, `label: CLASS_NAMES[slug]`).
 */
export const CLASS_NAMES = {
  barbarian: 'Barbarian',
  bard: 'Bard',
  cleric: 'Cleric',
  druid: 'Druid',
  fighter: 'Fighter',
  monk: 'Monk',
  paladin: 'Paladin',
  ranger: 'Ranger',
  rogue: 'Rogue',
  sorcerer: 'Sorcerer',
  warlock: 'Warlock',
  wizard: 'Wizard',
} as const

export type ClassSlug = keyof typeof CLASS_NAMES | (string & {})

/** Class slug reference — SRD keys from `CLASS_NAMES` or any homebrew slug. */
export const classSlugSchema = z.string().min(1)

/**
 * Returns the display name for a class slug.
 * Falls back to the raw slug for homebrew/unknown classes.
 *
 * @example getClassName('paladin') // → 'Paladin'
 */
export function getClassName(slug: string): string {
  return slug in CLASS_NAMES ? CLASS_NAMES[slug as keyof typeof CLASS_NAMES] : slug
}

/** Whether a resolved class record includes a spellcasting block (seed, homebrew, or patch). */
export function classHasSpellcasting(cls: CharacterClass): boolean {
  return cls.spellcasting !== undefined
}

// ---------------------------------------------------------------------------
// Deferred — documented intentionally, not built in this phase:
//
// - extraAttacks: [{ level, attacks }] — structured Extra Attack progression
//   (Fighter 5/11/20). For now Extra Attack is a `features[]` row only.
// - Feature effects engine (formula/condition/modifier/aura).
// - Warlock mysticArcanum; spell-slot / spells-known tables.
// - Skill governing-ability and full weapon/armor/skill content types (built in
//   their feature folders; schemas added to their contract modules).
// - Merge granularity for overlay patches: the read-time merge deep-merges
//   objects but replaces arrays wholesale (override `features` entirely, not
//   element-wise). Per-element array patching is deferred.
// - CANTRIPS_KNOWN_PROFILES: a seed-only authoring helper (NOT in the contract)
//   that expands shared SRD cantrip curves into the inline `cantrips` table.
// ---------------------------------------------------------------------------
