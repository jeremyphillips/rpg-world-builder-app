import { z } from 'zod'

import { vocabularyValidationMessages } from './vocabulary-messages'

// ---------------------------------------------------------------------------
// Campaign vocabulary — reusable option sets (creature types, damage types, …)
// scoped to a campaign ruleset. System seed data lives in catalog JSON; campaign
// deltas are stored as ruleset patches (source `campaign`, not content `homebrew`).
// UI may render `campaign` entries as "Custom".
// ---------------------------------------------------------------------------

/** Lowercase slug shape shared with content keys — validates id format only. */
export const vocabularyOptionIdSchema = z.string().regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/)

export type VocabularyOptionId = z.infer<typeof vocabularyOptionIdSchema>

export const VOCABULARY_OPTION_SOURCES = ['system', 'campaign'] as const

export const vocabularyOptionSourceSchema = z.enum(VOCABULARY_OPTION_SOURCES)

export type VocabularyOptionSource = z.infer<typeof vocabularyOptionSourceSchema>

export const VOCABULARY_OPTION_STATUSES = ['active', 'disabled'] as const

export const vocabularyOptionStatusSchema = z.enum(VOCABULARY_OPTION_STATUSES)

export type VocabularyOptionStatus = z.infer<typeof vocabularyOptionStatusSchema>

/** Known vocabulary set ids — only some sets are implemented in product UI. */
export const VOCABULARY_OPTION_SET_IDS = [
  'creature-types',
  'damage-types',
  'conditions',
  'languages',
  'senses',
  'sizes',
  'spell-schools',
  'weapon-properties',
  'equipment-categories',
  'edition-presets',
  'attack-resolution-modes',
] as const

export const vocabularyOptionSetIdSchema = z.enum(VOCABULARY_OPTION_SET_IDS)

export type VocabularyOptionSetId = z.infer<typeof vocabularyOptionSetIdSchema>

/** One system vocabulary row in catalog seed JSON (before merge into a resolved set). */
export const vocabularySeedOptionSchema = z.object({
  id: vocabularyOptionIdSchema,
  label: z.string().min(1),
  description: z.string().min(1),
})

export type VocabularySeedOption = z.infer<typeof vocabularySeedOptionSchema>

/** One resolved option after merging catalog seed + campaign patch. */
export const vocabularyOptionSchema = z.object({
  id: vocabularyOptionIdSchema,
  label: z.string().min(1),
  description: z.string().optional(),
  source: vocabularyOptionSourceSchema,
  status: vocabularyOptionStatusSchema,
})

export type VocabularyOption = z.infer<typeof vocabularyOptionSchema>

/** Resolved option set returned to clients (e.g. GET vocabulary). */
export const vocabularyOptionSetSchema = z.object({
  id: vocabularyOptionSetIdSchema,
  options: z.array(vocabularyOptionSchema),
})

export type VocabularyOptionSet = z.infer<typeof vocabularyOptionSetSchema>

/** Resolved option with usage count for vocabulary management UI. */
export const vocabularyOptionWithUsageSchema = vocabularyOptionSchema.extend({
  usedBy: z.number().int().min(0),
})

export type VocabularyOptionWithUsage = z.infer<typeof vocabularyOptionWithUsageSchema>

export const resolvedVocabularyOptionSetSchema = z.object({
  id: vocabularyOptionSetIdSchema,
  options: z.array(vocabularyOptionWithUsageSchema),
})

export type ResolvedVocabularyOptionSet = z.infer<typeof resolvedVocabularyOptionSetSchema>

/** Usage summary for delete/disable guards — `usedBy` may be stubbed until wired. */
export const vocabularyOptionUsageSchema = z.object({
  id: vocabularyOptionIdSchema,
  usedBy: z.number().int().min(0),
})

export type VocabularyOptionUsage = z.infer<typeof vocabularyOptionUsageSchema>

// ---------------------------------------------------------------------------
// Patch deltas — stored on CampaignRulesetPatch, keyed by (campaignId, rulesetId)
// ---------------------------------------------------------------------------

export const vocabularySystemEntryPatchSchema = z
  .object({
    label: z.string().min(1).optional(),
    description: z.string().optional(),
    status: vocabularyOptionStatusSchema.optional(),
  })
  .strict()

export type VocabularySystemEntryPatch = z.infer<typeof vocabularySystemEntryPatchSchema>

export const vocabularySystemEntryPatchEntrySchema = vocabularySystemEntryPatchSchema.extend({
  id: vocabularyOptionIdSchema,
})

export type VocabularySystemEntryPatchEntry = z.infer<typeof vocabularySystemEntryPatchEntrySchema>

export const vocabularyCampaignEntrySchema = z
  .object({
    id: vocabularyOptionIdSchema,
    label: z.string().min(1),
    description: z.string().optional(),
    status: vocabularyOptionStatusSchema.default('active'),
  })
  .strict()

export type VocabularyCampaignEntry = z.infer<typeof vocabularyCampaignEntrySchema>

/** Per-set delta stored inside a campaign ruleset patch document. */
export const vocabularyOptionSetPatchSchema = z
  .object({
    setId: vocabularyOptionSetIdSchema,
    systemEntryPatches: z.array(vocabularySystemEntryPatchEntrySchema).optional(),
    campaignEntries: z.array(vocabularyCampaignEntrySchema).optional(),
    removedCampaignEntryIds: z.array(vocabularyOptionIdSchema).optional(),
  })
  .strict()

export type VocabularyOptionSetPatch = z.infer<typeof vocabularyOptionSetPatchSchema>

// ---------------------------------------------------------------------------
// Write DTOs — API input for vocabulary CRUD (Phase 3+)
// ---------------------------------------------------------------------------

export const createVocabularyCampaignEntryInputSchema = z
  .object({
    setId: vocabularyOptionSetIdSchema,
    id: vocabularyOptionIdSchema,
    label: z.string().min(1),
    description: z.string().optional(),
  })
  .strict()

export type CreateVocabularyCampaignEntryInput = z.infer<
  typeof createVocabularyCampaignEntryInputSchema
>

export const updateVocabularyEntryInputSchema = z
  .object({
    label: z.string().min(1).optional(),
    description: z.string().optional(),
    status: vocabularyOptionStatusSchema.optional(),
  })
  .strict()

export type UpdateVocabularyEntryInput = z.infer<typeof updateVocabularyEntryInputSchema>

export const patchVocabularySystemEntryInputSchema = updateVocabularyEntryInputSchema.extend({
  setId: vocabularyOptionSetIdSchema,
  id: vocabularyOptionIdSchema,
})

export type PatchVocabularySystemEntryInput = z.infer<typeof patchVocabularySystemEntryInputSchema>

// ---------------------------------------------------------------------------
// Resolved-set membership — catalog validation runs against active option ids
// ---------------------------------------------------------------------------

/** Zod schema that accepts only ids present in a resolved vocabulary set. */
export function createVocabularyMemberSchema(activeIds: ReadonlySet<string>) {
  return vocabularyOptionIdSchema.refine((id) => activeIds.has(id), {
    message: vocabularyValidationMessages.unrecognizedOption(),
  })
}

/** Returns active option ids from a resolved set. */
export function activeVocabularyOptionIds(set: VocabularyOptionSet): ReadonlySet<string> {
  return new Set(
    set.options.filter((option) => option.status === 'active').map((option) => option.id),
  )
}

/** Lookup label for a vocabulary option; falls back to the raw id. */
export function getVocabularyOptionLabel(set: VocabularyOptionSet, id: string): string {
  return set.options.find((option) => option.id === id)?.label ?? id
}
