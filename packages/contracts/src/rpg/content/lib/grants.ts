import { z } from 'zod'

import { contentPoolChoiceSchema } from './choice'
import { abilitySchema } from '../../vocab/ability'
import { armorCategorySchema } from '../../vocab/armor/category'
import { damageTypeIdSchema } from '../../vocab/damage/vocabulary'
import { absoluteLevelSchema } from '../../primitives/level'
import { speedSchema } from '../../vocab/movement-mode'
import { senseSchema } from '../../vocab/sense'
import { usageFrequencySchema } from '../../vocab/usage-frequency'
import { featCategorySchema } from '../../vocab/feat'
import { languageCategorySchema, languageIdSchema } from '../../vocab/language'
import { skillSchema } from '../skill-proficiency'
import { equipmentGrantSchema } from './equipment-grant'

// ---------------------------------------------------------------------------
// Content grants — shared mechanical payload for species traits, class features,
// subclass features, and feat-choice features. Optional fields only; no rules engine.
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
  level: absoluteLevelSchema,
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

// --- Language choices --------------------------------------------------------

/**
 * A language choice grant from a constrained pool.
 *
 * Fixed languages use `contentGrants.languages`. Choice grants use this shape so
 * class features such as Rogue's Thieves' Cant can grant one fixed language plus
 * an additional pick from the character-creation language tables.
 */
export const languageChoiceGrantSchema = contentPoolChoiceSchema
  .extend({
    from: z.array(languageIdSchema).min(1).optional(),
    categories: z.array(languageCategorySchema).min(1).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.from === undefined && val.categories === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'language choices require a fixed language list or language categories',
        path: ['from'],
      })
    }
  })

export type LanguageChoiceGrant = z.infer<typeof languageChoiceGrantSchema>

// --- Feat choices -----------------------------------------------------------

/**
 * A feat pick granted by a class feature, subclass feature, or species trait.
 * Pool is filtered by `category`; Epic Boon features may expand via `allowAnyQualifying`.
 */
export const featChoiceGrantSchema = z
  .object({
    category: featCategorySchema,
    choose: z.number().int().min(1).default(1),
    /** Epic Boon / ASI: category default **or** any feat the character qualifies for. */
    allowAnyQualifying: z.boolean().optional(),
    /** Fighter Fighting Style: may replace on later class levels. */
    replaceable: z.boolean().optional(),
    /** Feat slugs surfaced as recommendations in the character builder (not prose). */
    recommendedFeatIds: z.array(z.string().min(1)).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.allowAnyQualifying && val.category !== 'epic-boon' && val.category !== 'general') {
      ctx.addIssue({
        code: 'custom',
        message: 'allowAnyQualifying is only allowed when category is epic-boon or general',
        path: ['allowAnyQualifying'],
      })
    }
  })

export type FeatChoiceGrant = z.infer<typeof featChoiceGrantSchema>

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
  damageType: z.array(damageTypeIdSchema).optional(),
  resistances: z.array(damageTypeIdSchema).optional(),
  proficiencies: contentProficienciesSchema.optional(),
  languages: z.array(languageIdSchema).optional(),
  languageChoices: z.array(languageChoiceGrantSchema).optional(),
  innateSpells: innateSpellsSchema.optional(),
  featChoice: featChoiceGrantSchema.optional(),
  equipment: z.array(equipmentGrantSchema).optional(),
})

export type ContentGrants = z.infer<typeof contentGrantsSchema>

/** Returns grant bag keys that carry a non-empty value. */
function definedGrantKeys(grants: ContentGrants): (keyof ContentGrants)[] {
  return (Object.keys(grants) as (keyof ContentGrants)[]).filter((key) => {
    const value = grants[key]
    if (value === undefined) return false
    if (Array.isArray(value) && value.length === 0) return false
    return true
  })
}

/**
 * Phase-1 eligibility: grants fully described by a single atomic template
 * (one sense, one resistance, walk speed override, or one language).
 */
export function isGrantEligibleGrants(grants: ContentGrants): boolean {
  const keys = definedGrantKeys(grants)
  if (keys.length !== 1) return false

  const key = keys[0]!
  switch (key) {
    case 'senses':
      return grants.senses!.length === 1
    case 'resistances':
      return grants.resistances!.length === 1
    case 'speedOverride': {
      const override = grants.speedOverride!
      const modes = (Object.keys(override) as (keyof typeof override)[]).filter(
        (mode) => override[mode] !== undefined,
      )
      return modes.length === 1 && modes[0] === 'walk' && override.walk !== undefined
    }
    case 'languages':
      return grants.languages!.length === 1
    default:
      return false
  }
}

// --- Trait building block ---------------------------------------------------

export const CONTENT_TRAIT_KINDS = ['custom', 'grant'] as const

export const contentTraitKindSchema = z.enum(CONTENT_TRAIT_KINDS)

export type ContentTraitKind = z.infer<typeof contentTraitKindSchema>

/**
 * Named trait or feature: SRD prose plus optional structured grants (hybrids).
 * Class/subclass features always use this variant.
 */
export const customContentTraitSchema = z.object({
  kind: z.literal('custom'),
  id: z.string().min(1), // unique within the parent record — enforced at the service layer
  name: z.string().min(1),
  /** Rich-text HTML faithful to the SRD wording (body only — no "Level N:" prefix). */
  description: z.string().optional(),
  grants: contentGrantsSchema.optional(),
})

export type CustomContentTrait = z.infer<typeof customContentTraitSchema>

/**
 * Mechanics-only trait: display name and description are derived from `grants`
 * unless overridden. `grants` must pass {@link isGrantEligibleGrants}.
 */
export const grantContentTraitSchema = z
  .object({
    kind: z.literal('grant'),
    id: z.string().min(1),
    grants: contentGrantsSchema,
    nameOverride: z.string().min(1).optional(),
    descriptionOverride: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (!isGrantEligibleGrants(val.grants)) {
      ctx.addIssue({
        code: 'custom',
        message:
          'grant traits require a single atomic grant (one sense, resistance, walk speed, or language)',
        path: ['grants'],
      })
    }
  })

export type GrantContentTrait = z.infer<typeof grantContentTraitSchema>

const contentTraitUnionSchema = z.discriminatedUnion('kind', [
  customContentTraitSchema,
  grantContentTraitSchema,
])

/** Defaults missing `kind` to `custom` for legacy homebrew records. */
export function normalizeContentTrait(input: unknown): unknown {
  if (typeof input !== 'object' || input === null) return input
  const record = input as Record<string, unknown>
  if (record['kind'] !== undefined) return input
  return { ...record, kind: 'custom' }
}

/**
 * Universal building block for species traits and heritage options.
 * Class features extend {@link customContentTraitSchema} only.
 */
export const contentTraitSchema = z.preprocess(normalizeContentTrait, contentTraitUnionSchema)

export type ContentTrait = z.infer<typeof contentTraitSchema>
