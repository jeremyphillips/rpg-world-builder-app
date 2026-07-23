import { z } from 'zod'

import { abilitySchema } from '../../vocab/ability'
import { hitDieSchema } from '../../primitives/dice'
import { absoluteLevelSchema } from '../../primitives/level'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from '../lib/envelope'
import { customContentTraitSchema, normalizeContentTrait } from '../lib/grants'
import type { GrantGroup } from '../lib/grants'
import {
  armorProficiencyGrantSetSchema,
  skillProficiencyGrantSetSchema,
  toolProficiencyGrantSetSchema,
  weaponProficiencyGrantSetSchema,
} from '../lib/proficiency-grant-set'

import { classCharacterCreationSchema } from '../starting-equipment'
import { spellcastingSchema } from './spellcasting'
import { classValidationMessages } from './class-messages'

// ---------------------------------------------------------------------------
// Class — SRD-faithful prose lives in rich-text HTML on `description` and
// `features[].description`; structured fields (proficiencies, spellcasting, etc.)
// are data the character builder reads, not a rules engine.
// ---------------------------------------------------------------------------

// --- Class features + proficiencies ----------------------------------------

export const CLASS_FEATURE_KINDS = ['custom', 'subclass-choice'] as const

export type ClassFeatureKind = (typeof CLASS_FEATURE_KINDS)[number]

function refineClassFeatureGrantUnlockLevels(
  feature: { level: number; grantGroups?: GrantGroup[] },
  ctx: z.RefinementCtx,
): void {
  for (const group of (feature.grantGroups ?? []) as GrantGroup[]) {
    if (group.unlock !== undefined && group.unlock.level <= feature.level) {
      ctx.addIssue({
        code: 'custom',
        message: classValidationMessages.grantGroupUnlockAfterFeatureLevel({
          unlockLevel: group.unlock.level,
          featureLevel: feature.level,
        }),
        path: ['grantGroups'],
      })
    }
  }
}

export const customClassFeatureSchema = customContentTraitSchema
  .extend({ level: absoluteLevelSchema })
  .superRefine(refineClassFeatureGrantUnlockLevels)

export const subclassChoiceClassFeatureSchema = customContentTraitSchema
  .extend({ kind: z.literal('subclass-choice'), level: absoluteLevelSchema })
  .superRefine(refineClassFeatureGrantUnlockLevels)

export const classFeatureSchema = z.preprocess(
  normalizeContentTrait,
  z.discriminatedUnion('kind', [customClassFeatureSchema, subclassChoiceClassFeatureSchema]),
)

export type ClassFeature = z.infer<typeof classFeatureSchema>

/** Subclass features share the class feature shape (level + optional grants). */
export const subclassFeatureSchema = classFeatureSchema

export type SubclassFeature = z.infer<typeof subclassFeatureSchema>

export const classProficienciesSchema = z.object({
  savingThrows: z.array(abilitySchema).min(1).max(3), // relaxed for homebrew (SRD uses 2)
  armor: armorProficiencyGrantSetSchema,
  weapons: weaponProficiencyGrantSetSchema,
  tools: toolProficiencyGrantSetSchema.optional(),
  skills: skillProficiencyGrantSetSchema,
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

/** Persisted body — seed, homebrew Mongo, and overlay patches. */
export const classStoredBodySchema = contentBodyBaseSchema.extend({
  primaryAbilities: z.array(abilitySchema).min(1),
  hitDie: hitDieSchema,
  spellcasting: spellcastingSchema.optional(),
  proficiencies: classProficienciesSchema,
  features: z.array(classFeatureSchema),
  resources: z.array(classResourceSchema).optional(),
  characterCreation: classCharacterCreationSchema.optional(),
})

export type ClassStoredBody = z.infer<typeof classStoredBodySchema>

/** Read body — same shape as stored (class-owned proficiency choices). */
export const classBodySchema = classStoredBodySchema

export type ClassBody = z.infer<typeof classBodySchema>

/** Display label for the subclass choice milestone on class progression tables. */
export function subclassChoiceFeatureLabel(className: string): string {
  return `${className} Subclass`
}

/** Stable class feature id for the subclass choice milestone. */
export function subclassChoiceFeatureId(classSlug: string): string {
  return `${classSlug}-subclass`
}

/** Stored record = envelope + persisted body (seed JSON, Mongo, patch merge target). */
export const classStoredSchema = contentMetaSchema.extend(classStoredBodySchema.shape)
export type ClassStored = z.infer<typeof classStoredSchema>

/** Read record = envelope + body. */
export const classSchema = contentMetaSchema.extend(classBodySchema.shape)
export type CharacterClass = z.infer<typeof classSchema>

type ClassSubclassChoiceFeatureSource = {
  slug: string
  features: readonly ClassFeature[]
}

/** Finds the explicit feature row that marks when a class chooses a subclass. */
export function subclassChoiceFeature(characterClass: ClassSubclassChoiceFeatureSource) {
  return characterClass.features.find(
    (feature) => feature.id === subclassChoiceFeatureId(characterClass.slug),
  )
}

/** Level at which a class chooses a subclass, derived from its feature rows. */
export function subclassChoiceFeatureLevel(
  characterClass: ClassSubclassChoiceFeatureSource,
): number | undefined {
  return subclassChoiceFeature(characterClass)?.level
}

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

/** Resolved list row — body fields plus campaign availability metadata. */
export const resolvedSubclassSchema = subclassSchema.extend({
  activeInCampaign: z.boolean(),
})
export type ResolvedSubclass = z.infer<typeof resolvedSubclassSchema>

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

/** Opaque class slug — resolve display names from resolved catalog `name` at read/UI time. */
export const classSlugSchema = z.string().min(1)

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
