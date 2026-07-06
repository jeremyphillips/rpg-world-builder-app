import { z } from 'zod'
import { abilitySchema } from '../vocab/ability'
import { formatVocabularySlugLabel } from '../vocab/format-slug-label'
import { getTermSentenceForm } from '../vocab/types'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './lib/envelope'

// ---------------------------------------------------------------------------
// Skill references — skill proficiencies are a content type. Stored grants and
// class proficiency fields keep opaque slugs; resolved catalog rows provide
// labels, descriptions, and campaign patches at read/UI time.
// ---------------------------------------------------------------------------

export const skillSchema = slugSchema

export type SkillId = z.infer<typeof skillSchema>

/**
 * Returns the display name for a skill id.
 * Falls back to the raw id for homebrew/unknown skills.
 *
 * @example getSkillName('animal-handling') // → 'Animal Handling'
 */
export function getSkillName(id: string): string {
  return formatVocabularySlugLabel(id)
}

/** Counted noun phrase for generated skill prose. */
export function getSkillSentenceForm(id: string, count = 1, label = getSkillName(id)): string {
  return getTermSentenceForm({ label, description: '' }, count)
}

// ---------------------------------------------------------------------------
// Skill Proficiency — a single skill as a first-class catalog content type.
// Extends the shared content envelope with a governing ability (the stat used
// when rolling checks) and class slugs that suggest this skill for starting
// proficiency selection.
// ---------------------------------------------------------------------------

/** Class slugs that suggest this skill (min 1). Authoritative for the class↔skill edge. */
export const suggestedClassesSchema = z.array(z.string()).min(1)

/** The editable shape: what a form authors and what a patch overrides. */
export const skillProficiencyBodySchema = contentBodyBaseSchema.extend({
  /** The ability score used when making this skill check (e.g. `str` for Athletics). */
  ability: abilitySchema,
  /**
   * Class slugs that suggest this skill for starting proficiency selection.
   * Authoritative write surface for the class↔skill association; class
   * `proficiencies.skills.from` is derived from this field at read time.
   * Stores slugs (not class ids) — see `docs/content-types.md` known gaps.
   */
  suggestedClasses: suggestedClassesSchema,
})

export type SkillProficiencyBody = z.infer<typeof skillProficiencyBodySchema>

/** Stored shape = ownership envelope + body. */
export const skillProficiencySchema = contentMetaSchema.extend(skillProficiencyBodySchema.shape)
export type SkillProficiency = z.infer<typeof skillProficiencySchema>

// Homebrew authoring DTOs (forms). Server sets id/source/campaignId/timestamps.
export const createSkillProficiencyInputSchema = skillProficiencyBodySchema.extend({
  slug: slugSchema,
})
export type CreateSkillProficiencyInput = z.infer<typeof createSkillProficiencyInputSchema>

export const updateSkillProficiencyInputSchema = createSkillProficiencyInputSchema.partial()
export type UpdateSkillProficiencyInput = z.infer<typeof updateSkillProficiencyInputSchema>

/**
 * System-patch overlay. Reuses the generic envelope; only the type-specific
 * `patch` body differs. `.partial()` is shallow; the read-time merge handles
 * deep-merging (arrays replaced wholesale).
 */
export const skillProficiencyPatchSchema = contentPatchBaseSchema.extend({
  patch: skillProficiencyBodySchema.partial(),
})
export type SkillProficiencyPatch = z.infer<typeof skillProficiencyPatchSchema>
