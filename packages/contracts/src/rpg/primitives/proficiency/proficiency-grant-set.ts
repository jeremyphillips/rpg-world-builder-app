import { z } from 'zod'

import { overlaySlugList } from '../../content/lib/system-overlay/overlay-presets'
import { languageCategorySchema, languageIdSchema } from '../../vocab/language'

// ---------------------------------------------------------------------------
// Proficiency grant sets and choices — boundary-safe primitives shared by
// content authoring, campaign patches, and runtime resolution.
// ---------------------------------------------------------------------------

/** Fixed grant bucket: category and/or item slugs granted immediately. */
export const proficiencyGrantSetSchema = z
  .object({
    categories: overlaySlugList(z.string()).default([]),
    items: overlaySlugList(z.string()).default([]),
  })
  .strict()

export type ProficiencyGrantSet = z.infer<typeof proficiencyGrantSetSchema>

export function isEmptyProficiencyGrantSet(
  grant: Pick<ProficiencyGrantSet, 'categories' | 'items'>,
): boolean {
  return grant.categories.length === 0 && grant.items.length === 0
}

/** Domain-agnostic choice primitive — `from` holds opaque slugs; vocab validated on extensions. */
export const proficiencyChoiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().optional(),
  choose: z.number().int().min(0),
  from: overlaySlugList(z.string()).default([]),
})

export type ProficiencyChoice = z.infer<typeof proficiencyChoiceSchema>

/** A choice is meaningful when the player must pick from a non-empty pool. */
export function isMeaningfulProficiencyChoice(choice: ProficiencyChoice): boolean {
  return choice.choose > 0 && choice.from.length > 0
}

export const languageProficiencyGrantSetSchema = proficiencyGrantSetSchema.extend({
  categories: overlaySlugList(languageCategorySchema).default([]),
  items: overlaySlugList(languageIdSchema).default([]),
})

export type LanguageProficiencyGrantSet = z.infer<typeof languageProficiencyGrantSetSchema>

export const languageProficiencyChoiceSchema = proficiencyChoiceSchema.extend({
  from: overlaySlugList(languageIdSchema).default([]),
  categories: overlaySlugList(languageCategorySchema).default([]),
})

export type LanguageProficiencyChoice = z.infer<typeof languageProficiencyChoiceSchema>

/** A language choice is meaningful when the player must pick from items and/or categories. */
export function isMeaningfulLanguageProficiencyChoice(choice: LanguageProficiencyChoice): boolean {
  return choice.choose > 0 && (choice.from.length > 0 || choice.categories.length > 0)
}
