import { z } from 'zod'
import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import { abilitySchema } from '../../vocab/ability'
import { hitDieSchema } from '../../primitives/dice'
import { absoluteLevelSchema } from '../../primitives/level'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from '../lib/envelope'
import {
  mediaBearingAuthoredContentBodySchema,
  mediaBearingDraftAuthoredContentBodySchema,
} from '../lib/media/media-bearing-content'
import { customContentTraitSchema, normalizeContentTrait } from '../lib/grants'
import type { GrantGroup } from '../lib/grants'
import {
  armorProficiencyGrantSetSchema,
  skillProficiencyGrantSetSchema,
  toolProficiencyGrantSetSchema,
  weaponProficiencyGrantSetSchema,
} from '../lib/grants/proficiency-grant-set'
import { CLASS_CONTENT_TYPE_TERM } from '../lib/content-type-terms'
import { createDraftInputSchema, draftStoredSchema } from '../lib/content-input-schemas'

import {
  classCharacterCreationDraftSchema,
  classCharacterCreationSchema,
} from '../starting-equipment'
import { spellcastingDraftSchema, spellcastingSchema } from './spellcasting'
import { isSpellcastingClassFeature } from './spellcasting/class-spellcasting-ownership'
import { classValidationMessages } from './class-messages'
import { contentSummaryRefSchema } from '../lib/content-summary-ref'
import { contentTableSchema } from '../tables'
import { refineFeatureTablesOnFeature } from './class-feature-table'

// ---------------------------------------------------------------------------
// Class — SRD-faithful prose lives in rich-text HTML on `description` and
// `features[].description`; structured fields (proficiencies, spellcasting, etc.)
// are data the character builder reads, not a rules engine.
// ---------------------------------------------------------------------------

// --- Class features + proficiencies ----------------------------------------

export const CLASS_FEATURE_KINDS = ['custom', 'asi', 'spellcasting', 'subclass-choice'] as const

export type ClassFeatureKind = (typeof CLASS_FEATURE_KINDS)[number]

export const CLASS_FEATURE_KIND_ENTRIES = {
  asi: { label: 'Ability Score Improvement' },
  spellcasting: { label: 'Spellcasting' },
  'subclass-choice': { label: 'Subclass' },
} as const satisfies Partial<Record<ClassFeatureKind, { label: string }>>

const classFeatureIdentitySchema = {
  id: z.string().min(1),
  level: absoluteLevelSchema,
} as const

function refineClassFeatureGrantUnlockLevels(
  feature: { level: number; grantGroups?: GrantGroup[] },
  ctx: z.RefinementCtx,
): void {
  for (const group of (feature.grantGroups ?? []) as GrantGroup[]) {
    if (group.unlock !== undefined && group.unlock.level <= feature.level) {
      addCustomRefinementIssue(
        ctx,
        classValidationMessages.grantGroupUnlockAfterFeatureLevel({
          unlockLevel: group.unlock.level,
          featureLevel: feature.level,
        }),
        ['grantGroups'],
      )
    }
  }
}

const classFeatureTablesField = {
  tables: z.array(contentTableSchema).optional(),
} as const

export const customClassFeatureSchema = customContentTraitSchema
  .extend({ ...classFeatureIdentitySchema, ...classFeatureTablesField })
  .superRefine(refineClassFeatureGrantUnlockLevels)
  .superRefine(refineFeatureTablesOnFeature)

export const asiClassFeatureSchema = z.object({
  kind: z.literal('asi'),
  ...classFeatureIdentitySchema,
  name: z.string().min(1),
  description: z.string().optional(),
})

export const spellcastingClassFeatureSchema = z.object({
  kind: z.literal('spellcasting'),
  ...classFeatureIdentitySchema,
  name: z.string().min(1),
  intro: z.string().optional(),
})

export const subclassChoiceClassFeatureSchema = z.object({
  kind: z.literal('subclass-choice'),
  ...classFeatureIdentitySchema,
  name: z.string().min(1).optional(),
})

const classFeatureUnionSchema = z.discriminatedUnion('kind', [
  customClassFeatureSchema,
  asiClassFeatureSchema,
  spellcastingClassFeatureSchema,
  subclassChoiceClassFeatureSchema,
])

export const classFeatureSchema = z.preprocess(normalizeContentTrait, classFeatureUnionSchema)

export type ClassFeature = z.infer<typeof classFeatureSchema>

const classBodyFeatureAvailabilityFields = {
  available: z.boolean().optional(),
} as const

const classBodyCustomFeatureSchema = customClassFeatureSchema.extend(
  classBodyFeatureAvailabilityFields,
)

const classBodyAsiFeatureSchema = asiClassFeatureSchema.extend(classBodyFeatureAvailabilityFields)

const classBodySpellcastingFeatureSchema = spellcastingClassFeatureSchema.extend(
  classBodyFeatureAvailabilityFields,
)

const classBodySubclassChoiceFeatureSchema = subclassChoiceClassFeatureSchema.extend(
  classBodyFeatureAvailabilityFields,
)

/** Class-body feature — class feature shape plus optional campaign availability. */
export const classBodyFeatureSchema = z.preprocess(
  normalizeContentTrait,
  z.discriminatedUnion('kind', [
    classBodyCustomFeatureSchema,
    classBodyAsiFeatureSchema,
    classBodySpellcastingFeatureSchema,
    classBodySubclassChoiceFeatureSchema,
  ]),
)

export type ClassBodyFeature = z.infer<typeof classBodyFeatureSchema>

/** Subclass features are custom-only class feature rows. */
export const subclassFeatureSchema = z.preprocess(normalizeContentTrait, customClassFeatureSchema)

export type SubclassFeature = z.infer<typeof subclassFeatureSchema>

export const classProficienciesSchema = z.object({
  savingThrows: z.array(abilitySchema).min(1).max(3), // relaxed for homebrew (SRD uses 2)
  armor: armorProficiencyGrantSetSchema,
  weapons: weaponProficiencyGrantSetSchema,
  tools: toolProficiencyGrantSetSchema.optional(),
  skills: skillProficiencyGrantSetSchema,
})

export type ClassProficiencies = z.infer<typeof classProficienciesSchema>

/** Draft class proficiencies — saving throws and nested buckets may be empty while authoring. */
export const classProficienciesDraftSchema = z.object({
  savingThrows: z.array(abilitySchema).max(3).default([]),
  armor: armorProficiencyGrantSetSchema,
  weapons: weaponProficiencyGrantSetSchema,
  tools: toolProficiencyGrantSetSchema.optional(),
  skills: skillProficiencyGrantSetSchema,
})

export type ClassProficienciesDraft = z.infer<typeof classProficienciesDraftSchema>

// ---------------------------------------------------------------------------
// Class — editable body + stored shape
// ---------------------------------------------------------------------------

const classStoredBodyBaseSchema = mediaBearingAuthoredContentBodySchema.extend({
  primaryAbilities: z.array(abilitySchema).min(1),
  hitDie: hitDieSchema,
  spellcasting: spellcastingSchema.optional(),
  proficiencies: classProficienciesSchema,
  features: z.array(classBodyFeatureSchema),
  characterCreation: classCharacterCreationSchema.optional(),
})

/** Persisted body — seed, homebrew Mongo, and overlay patches. */
export const classStoredBodySchema = classStoredBodyBaseSchema.superRefine(
  refineClassBodyFeaturesAggregate,
)

export type ClassStoredBody = z.infer<typeof classStoredBodySchema>

/** Draft save body — untitled name fallback; core progression fields optional. */
export const classBodyDraftSchema = mediaBearingDraftAuthoredContentBodySchema(
  CLASS_CONTENT_TYPE_TERM.label,
).extend({
  primaryAbilities: z.array(abilitySchema).max(2).optional(),
  hitDie: hitDieSchema.optional(),
  spellcasting: spellcastingDraftSchema.optional(),
  proficiencies: classProficienciesDraftSchema.optional(),
  features: z.array(classBodyFeatureSchema).default([]),
  characterCreation: classCharacterCreationDraftSchema.optional(),
})

export type ClassBodyDraft = z.infer<typeof classBodyDraftSchema>

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

/** Stored draft shape — relaxed body fields for in-progress homebrew. */
export const classDraftStoredSchema = draftStoredSchema(classBodyDraftSchema)
export type ClassDraft = z.infer<typeof classDraftStoredSchema>

/** Read record = envelope + body. */
export const classSchema = contentMetaSchema.extend(classBodySchema.shape)
export type CharacterClass = z.infer<typeof classSchema>

/** Class list row enriched with subclass summaries for overview tables. */
export const classListItemSchema = classSchema.extend({
  subclasses: z.array(contentSummaryRefSchema),
})
export type ClassListItem = z.infer<typeof classListItemSchema>

type ClassSubclassChoiceFeatureSource = {
  slug: string
  features: readonly ClassBodyFeature[]
}

/** Finds the explicit feature row that marks when a class chooses a subclass. */
export function subclassChoiceFeature(characterClass: ClassSubclassChoiceFeatureSource) {
  return characterClass.features.find((feature) => feature.kind === 'subclass-choice')
}

/** Display name for a class feature row (subclass milestone title derivation only). */
export function resolveClassFeatureName(
  feature: Pick<ClassBodyFeature, 'kind' | 'name'>,
  className: string,
): string {
  if (feature.kind === 'subclass-choice') {
    return feature.name ?? subclassChoiceFeatureLabel(className)
  }
  return feature.name
}

/** Level at which a class chooses a subclass, derived from its feature rows. */
export function subclassChoiceFeatureLevel(
  characterClass: ClassSubclassChoiceFeatureSource,
): number | undefined {
  return subclassChoiceFeature(characterClass)?.level
}

function refineUniqueClassFeatureIds(features: ClassBodyFeature[], ctx: z.RefinementCtx): void {
  const seen = new Set<string>()
  for (const feature of features) {
    if (seen.has(feature.id)) {
      addCustomRefinementIssue(ctx, classValidationMessages.duplicateClassFeatureId(), ['features'])
      return
    }
    seen.add(feature.id)
  }
}

function refineSubclassChoiceCardinality(features: ClassBodyFeature[], ctx: z.RefinementCtx): void {
  const count = features.filter((feature) => feature.kind === 'subclass-choice').length
  if (count <= 1) return
  addCustomRefinementIssue(ctx, classValidationMessages.subclassChoiceFeatureDuplicate(), [
    'features',
  ])
}

function refineSpellcastingConfigFeaturePairing(
  value: Pick<ClassStoredBody, 'spellcasting' | 'features'>,
  ctx: z.RefinementCtx,
): void {
  const spellcastingFeatures = value.features.filter(isSpellcastingClassFeature)
  const hasConfig = value.spellcasting !== undefined
  const hasFeature = spellcastingFeatures.length > 0

  if (!hasConfig && !hasFeature) return
  if (hasConfig && spellcastingFeatures.length === 1) return

  if (hasConfig && !hasFeature) {
    addCustomRefinementIssue(ctx, classValidationMessages.spellcastingConfigRequiresGrant(), [
      'spellcasting',
    ])
    return
  }

  if (!hasConfig && hasFeature) {
    addCustomRefinementIssue(ctx, classValidationMessages.spellcastingGrantRequiresConfig(), [
      'features',
    ])
    return
  }

  if (spellcastingFeatures.length > 1) {
    addCustomRefinementIssue(ctx, classValidationMessages.spellcastingGrantingFeatureDuplicate(), [
      'features',
    ])
  }
}

function refineClassBodyFeaturesAggregate(
  value: Pick<ClassStoredBody, 'spellcasting' | 'features'>,
  ctx: z.RefinementCtx,
): void {
  refineUniqueClassFeatureIds(value.features, ctx)
  refineSubclassChoiceCardinality(value.features, ctx)
  refineSpellcastingConfigFeaturePairing(value, ctx)
}

// Homebrew authoring DTOs (forms). Server sets id/source/campaignId/timestamps.
const createClassInputBaseSchema = classStoredBodyBaseSchema.extend({ slug: slugSchema })

export const createClassInputSchema = createClassInputBaseSchema.superRefine((value, ctx) => {
  refineClassBodyFeaturesAggregate(value, ctx)
  if (value.characterCreation && value.characterCreation.abilityScoreOrder === undefined) {
    addCustomRefinementIssue(ctx, 'characterCreation requires abilityScoreOrder on publish', [
      'characterCreation',
      'abilityScoreOrder',
    ])
  }
})
export type CreateClassInput = z.infer<typeof createClassInputBaseSchema>

export const createClassDraftInputSchema = createDraftInputSchema(classBodyDraftSchema)
export type CreateClassDraftInput = z.infer<typeof createClassDraftInputSchema>

export const updateClassInputSchema = createClassInputBaseSchema.partial()
export type UpdateClassInput = z.infer<typeof updateClassInputSchema>

export const updateClassDraftInputSchema = createClassDraftInputSchema.partial()
export type UpdateClassDraftInput = z.infer<typeof updateClassDraftInputSchema>

/**
 * System-patch overlay. Reuses the generic envelope; only the type-specific
 * `patch` body differs. `.partial()` is shallow (Zod v4 has no `deepPartial`);
 * the read-time merge does the deep-merge, replacing arrays wholesale (see the
 * Deferred block).
 */
export const classPatchSchema = contentPatchBaseSchema.extend({
  patch: classStoredBodyBaseSchema.partial(),
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

import { resolvedCampaignAccessFields } from '../lib/campaign-access'

/** Resolved list row — body fields plus campaign access metadata. */
export const resolvedSubclassSchema = subclassSchema.extend(resolvedCampaignAccessFields)
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
// ---------------------------------------------------------------------------
