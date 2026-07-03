import { z } from 'zod'
import { abilitySchema } from '../vocab/ability'
import { getTermSentenceForm, type GameTermEntry } from '../vocab/types'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './lib/envelope'

// ---------------------------------------------------------------------------
// Skill taxonomy — the SRD 5.2 skills as id -> display label. Previously in
// `skill.ts`; consolidated here as skill-proficiency is the authoritative
// content type for skills. `skillSchema` is still consumed by
// `classProficienciesSchema` in `class.ts`.
// ---------------------------------------------------------------------------

export const SKILL_ENTRIES = {
  acrobatics: {
    label: 'Acrobatics',
    description: 'Dexterity-based agility, balance, and tumbling checks.',
  },
  'animal-handling': {
    label: 'Animal Handling',
    description: 'Wisdom-based checks to calm, control, or intuit animals.',
  },
  arcana: {
    label: 'Arcana',
    description: 'Intelligence-based checks about magic, spells, and magical lore.',
  },
  athletics: {
    label: 'Athletics',
    description: 'Strength-based checks for climbing, jumping, swimming, and forceful movement.',
  },
  deception: {
    label: 'Deception',
    description: 'Charisma-based checks to mislead or disguise the truth.',
  },
  history: {
    label: 'History',
    description: 'Intelligence-based checks about historical events, people, and cultures.',
  },
  insight: {
    label: 'Insight',
    description: 'Wisdom-based checks to read intentions, moods, or sincerity.',
  },
  intimidation: {
    label: 'Intimidation',
    description: 'Charisma-based checks to influence through threats or pressure.',
  },
  investigation: {
    label: 'Investigation',
    description: 'Intelligence-based checks to deduce clues and interpret evidence.',
  },
  medicine: {
    label: 'Medicine',
    description: 'Wisdom-based checks to diagnose, stabilize, or treat creatures.',
  },
  nature: {
    label: 'Nature',
    description: 'Intelligence-based checks about terrain, plants, animals, and weather.',
  },
  perception: {
    label: 'Perception',
    description: 'Wisdom-based checks to notice hidden or subtle details.',
  },
  performance: {
    label: 'Performance',
    description: 'Charisma-based checks to entertain or present before an audience.',
  },
  persuasion: {
    label: 'Persuasion',
    description: 'Charisma-based checks to influence through tact or goodwill.',
  },
  religion: {
    label: 'Religion',
    description: 'Intelligence-based checks about deities, rites, and religious lore.',
  },
  'sleight-of-hand': {
    label: 'Sleight of Hand',
    description: 'Dexterity-based checks for legerdemain, theft, or manual trickery.',
  },
  stealth: {
    label: 'Stealth',
    description: 'Dexterity-based checks to hide or move unnoticed.',
  },
  survival: {
    label: 'Survival',
    description: 'Wisdom-based checks to track, forage, navigate, or endure wilderness hazards.',
  },
} as const satisfies Record<string, GameTermEntry>

/**
 * Skill id -> display name. Doubles as form select options
 * (`value: id`, `label: SKILLS[id]`).
 */
export const SKILLS = Object.fromEntries(
  Object.entries(SKILL_ENTRIES).map(([id, entry]) => [id, entry.label]),
) as { readonly [Id in keyof typeof SKILL_ENTRIES]: (typeof SKILL_ENTRIES)[Id]['label'] }

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

/** Returns the reference entry for a skill id, if known. */
export function getSkillEntry(id: string): GameTermEntry | undefined {
  return SKILL_ENTRIES[id as SkillId]
}

/** Counted noun phrase for generated skill prose. */
export function getSkillSentenceForm(id: string, count = 1): string {
  const entry = getSkillEntry(id)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: id, description: '' }, count)
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
