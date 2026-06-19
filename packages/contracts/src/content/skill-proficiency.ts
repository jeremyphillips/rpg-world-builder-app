import { z } from 'zod'
import { abilitySchema } from '../vocab/ability'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './envelope'

// ---------------------------------------------------------------------------
// Skill taxonomy — the SRD 5.2 skills as id -> display label. Previously in
// `skill.ts`; consolidated here as skill-proficiency is the authoritative
// content type for skills. `skillSchema` is still consumed by
// `classProficienciesSchema` in `class.ts`.
// ---------------------------------------------------------------------------

/**
 * Skill id -> display name. Doubles as form select options
 * (`value: id`, `label: SKILLS[id]`).
 */
export const SKILLS = {
  acrobatics: 'Acrobatics',
  'animal-handling': 'Animal Handling',
  arcana: 'Arcana',
  athletics: 'Athletics',
  deception: 'Deception',
  history: 'History',
  insight: 'Insight',
  intimidation: 'Intimidation',
  investigation: 'Investigation',
  medicine: 'Medicine',
  nature: 'Nature',
  perception: 'Perception',
  performance: 'Performance',
  persuasion: 'Persuasion',
  religion: 'Religion',
  'sleight-of-hand': 'Sleight of Hand',
  stealth: 'Stealth',
  survival: 'Survival',
} as const

export type SkillId = keyof typeof SKILLS

export const SKILL_IDS = Object.keys(SKILLS) as [SkillId, ...SkillId[]]

export const skillSchema = z.enum(SKILL_IDS)

/**
 * Returns the display name for a skill id.
 * Falls back to the raw id for homebrew/unknown skills.
 *
 * @example getSkillName('animal-handling') // → 'Animal Handling'
 */
export function getSkillName(id: string): string {
  return SKILLS[id as SkillId] ?? id
}

// ---------------------------------------------------------------------------
// Skill Proficiency — a single SRD skill as a first-class catalog content type.
// Extends the shared content envelope with a governing ability (the stat used
// when rolling checks) and an optional list of class slugs that commonly take
// this proficiency (convenience field for the detail page; `classes.json`
// remains the authoritative source for character-creation proficiency menus).
// ---------------------------------------------------------------------------

/** The editable shape: what a form authors and what a patch overrides. */
export const skillProficiencyBodySchema = contentBodyBaseSchema.extend({
  /** The ability score used when making this skill check (e.g. `str` for Athletics). */
  ability: abilitySchema,
  /**
   * Class slugs that commonly offer this skill as a starting proficiency choice.
   * Informational/display only — `classProficienciesSchema.skills.from` in
   * `class.ts` is the authoritative character-creation list. Kept in sync with
   * seed data manually.
   */
  suggestedClasses: z.array(z.string()).optional(),
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
