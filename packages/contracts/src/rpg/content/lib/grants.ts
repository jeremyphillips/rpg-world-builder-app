import { z } from 'zod'

import { contentPoolChoiceSchema } from './choice'
import { abilitySchema } from '../../vocab/ability'
import { getDamageTypeSentenceForm, damageTypeIdSchema } from '../../vocab/damage/vocabulary'
import { absoluteLevelSchema } from '../../primitives/level'
import { movementGrantPayloadSchema } from '../../vocab/movement-mode'
import { getSenseSentenceForm, senseSchema } from '../../vocab/sense'
import { getUsageFrequencySentenceForm, usageFrequencySchema } from '../../vocab/usage-frequency'
import { featCategorySchema, getFeatCategorySentenceForm } from '../../vocab/feat'
import {
  getLanguageCategorySentenceForm,
  getLanguageSentenceForm,
  languageCategorySchema,
  languageIdSchema,
} from '../../vocab/language'
import { equipmentGrantSchema } from './equipment-grant'
import {
  armorTrainingGrantSchema,
  skillProficiencyGrantSchema,
  toolProficiencyGrantSchema,
  weaponProficiencyGrantSchema,
} from './proficiency-grant'
import { joinNaturalList } from './proficiency-grant'

// ---------------------------------------------------------------------------
// Content grants — shared mechanical payload for species traits, class features,
// subclass features, and feat-choice features. Optional fields only; no rules engine.
// Player choices (e.g. "choose two skills") stay in rich-text descriptions.
// ---------------------------------------------------------------------------

// --- Innate spellcasting (legacy bag model — kept for catalog backward compat) ----

export const INNATE_SPELL_KINDS = ['free_cast', 'always_prepared'] as const

export const innateSpellKindSchema = z.enum(INNATE_SPELL_KINDS)

export type InnateSpellKind = z.infer<typeof innateSpellKindSchema>

/**
 * Spells gained at a character level. `spellIds` are opaque spell slugs for now
 * (no Spell content type yet); wire to real references when spells land.
 *
 * - `free_cast` — slotless casting cadence via `frequency` (species lineage pattern).
 * - `always_prepared` — always on the prepared list; cast with normal slots when used.
 *
 * @deprecated Superseded by the `spells` atomic grant in `contentGrantSchema`.
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

export function formatLanguageGrantSentence(languageIds: readonly string[]): string {
  return `Character knows ${joinNaturalList(languageIds.map((id) => getLanguageSentenceForm(id)))}.`
}

export function formatLanguageChoiceGrantSentence(grant: LanguageChoiceGrant): string {
  const languageWord = grant.choose === 1 ? 'language' : 'languages'
  if (grant.from?.length) {
    return `Character chooses ${grant.choose} ${languageWord} from ${joinNaturalList(
      grant.from.map((id) => getLanguageSentenceForm(id)),
    )}.`
  }
  if (grant.categories?.length) {
    return `Character chooses ${grant.choose} ${languageWord} from ${joinNaturalList(
      grant.categories.map((category) => getLanguageCategorySentenceForm(category, 2)),
    )}.`
  }
  return `Character chooses ${grant.choose} ${languageWord}.`
}

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

export function formatFeatChoiceGrantSentence(grant: FeatChoiceGrant): string {
  const featForm = getFeatCategorySentenceForm(grant.category, grant.choose)
  return `Character chooses ${grant.choose} ${featForm}.`
}

export function formatSenseGrantSentence(sense: z.infer<typeof senseSchema>): string {
  return `Character gains ${getSenseSentenceForm(sense.type)} with a range of ${sense.range} feet.`
}

export function formatDamageTypeGrantSentence(damageTypes: readonly string[]): string {
  return `Character chooses from ${joinNaturalList(
    damageTypes.map((id) => getDamageTypeSentenceForm(id)),
  )}.`
}

export function formatResistanceGrantSentence(damageTypes: readonly string[]): string {
  return `Character gains Resistance to ${joinNaturalList(
    damageTypes.map((id) => getDamageTypeSentenceForm(id)),
  )}.`
}

// --- Grants bag (legacy — kept for catalog backward compat) -----------------

/**
 * Structured, character-builder-facing payload. Every field is optional; purely
 * flavorful content omits `grants` and carries only rich-text description.
 *
 * @deprecated Superseded by the `grantGroups` model. Catalog seeds still use this
 *   shape and will be migrated to `grantGroups` in a subsequent phase.
 */
export const contentGrantsSchema = z.object({
  senses: z.array(senseSchema).optional(),
  /** Movement bonus (e.g. Wood Elf +5 ft walking speed). */
  movement: movementGrantPayloadSchema.optional(),
  /** Chosen damage type(s), e.g. a Dragonborn's breath or a Goliath's ancestry. */
  damageType: z.array(damageTypeIdSchema).optional(),
  resistances: z.array(damageTypeIdSchema).optional(),
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
 * Legacy eligibility check for the `grant` trait kind using the bag model.
 * Grants are eligible when fully described by a single atomic template
 * (one sense, one resistance, walk speed override, or one language).
 *
 * @deprecated Use {@link isGrantGroupsEligible} for the `grantGroups` model.
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
    case 'movement':
      return grants.movement !== undefined
    case 'languages':
      return grants.languages!.length === 1
    default:
      return false
  }
}

// ---------------------------------------------------------------------------
// Atomic content grants — discriminated union model
//
// Each variant is level-less: the timing lives in the enclosing `GrantGroup.unlock`.
// The `kind` field discriminates the union. Unlock kind (class level vs. character
// level) is implicit from the container — class/subclass features use class level;
// species traits use character level.
// ---------------------------------------------------------------------------

/** A single special sense granted by a trait or feature. */
const senseContentGrantSchema = senseSchema.extend({ kind: z.literal('sense') })

/** Damage resistance grant. */
const resistancesContentGrantSchema = z.object({
  kind: z.literal('resistances'),
  damageTypes: z.array(damageTypeIdSchema).min(1),
})

/** Chosen damage type(s) — e.g. a Dragonborn's breath or a Goliath's ancestry. */
const damageTypeContentGrantSchema = z.object({
  kind: z.literal('damageType'),
  damageTypes: z.array(damageTypeIdSchema).min(1),
})

/** Movement bonus — increases speed for a movement mode (e.g. Wood Elf +5 ft walk). */
const movementContentGrantSchema = movementGrantPayloadSchema.extend({
  kind: z.literal('movement'),
})

/** Weapon proficiency grant — fixed weapons/categories or a pool choice. */
const weaponProficiencyContentGrantSchema = z.object({
  kind: z.literal('weaponProficiency'),
  grant: weaponProficiencyGrantSchema,
})

/** Tool proficiency grant — fixed tools/categories or a pool choice. */
const toolProficiencyContentGrantSchema = z.object({
  kind: z.literal('toolProficiency'),
  grant: toolProficiencyGrantSchema,
})

/** Skill proficiency grant — fixed skills or a pool choice. */
const skillProficiencyContentGrantSchema = z.object({
  kind: z.literal('skillProficiency'),
  grant: skillProficiencyGrantSchema,
})

/** Armor training grant — fixed armor/categories or a pool choice. */
const armorTrainingContentGrantSchema = z.object({
  kind: z.literal('armorTraining'),
  grant: armorTrainingGrantSchema,
})

/** Fixed language grant. */
const languagesContentGrantSchema = z.object({
  kind: z.literal('languages'),
  languageIds: z.array(languageIdSchema).min(1),
})

/** Language choice from a constrained pool. */
const languageChoiceContentGrantSchema = z
  .object({
    kind: z.literal('languageChoice'),
    choose: z.number().int().min(1).default(1),
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

/** Feat pick from a filtered pool. */
const featChoiceContentGrantSchema = z
  .object({
    kind: z.literal('featChoice'),
    category: featCategorySchema,
    choose: z.number().int().min(1).default(1),
    allowAnyQualifying: z.boolean().optional(),
    replaceable: z.boolean().optional(),
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

/** Single equipment grant (a fixed item or a pool choice). */
const equipmentContentGrantSchema = z.object({
  kind: z.literal('equipment'),
  grant: equipmentGrantSchema,
})

/**
 * Spells granted by a trait or feature at a given unlock level.
 * Replaces the legacy `innateSpells` bag entry in the atomic model.
 *
 * - `free_cast` — slotless casting via `frequency` (species lineage pattern).
 * - `always_prepared` — always on the prepared list; cast with normal slots.
 */
const spellsContentGrantSchema = z
  .object({
    kind: z.literal('spells'),
    ability: abilitySchema,
    mode: z.enum(INNATE_SPELL_KINDS),
    frequency: usageFrequencySchema.optional(),
    spellIds: z.array(z.string().min(1)).min(1),
  })
  .superRefine((val, ctx) => {
    if (val.mode === 'always_prepared' && val.frequency !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'frequency is not allowed when mode is always_prepared',
        path: ['frequency'],
      })
    }
  })

export type SpellsContentGrant = z.infer<typeof spellsContentGrantSchema>

/** Human-readable summary for spell grants in trait and feature summaries. */
export function formatSpellsGrantSentence(
  grant: SpellsContentGrant,
  resolveSpellName?: (id: string) => string | undefined,
): string {
  const names = grant.spellIds.map((id) => resolveSpellName?.(id) ?? id)
  const spellList = joinNaturalList(names)

  if (grant.mode === 'always_prepared') {
    return `Character has ${spellList} always prepared.`
  }

  if (grant.frequency) {
    const cadence = getUsageFrequencySentenceForm(grant.frequency)
    return `Character can cast ${spellList} ${cadence}.`
  }

  return `Character gains ${spellList}.`
}

/**
 * Atomic, level-less content grant discriminated by `kind`.
 * Place grants inside `GrantGroup.grants`; the group's `unlock` carries timing.
 */
export const contentGrantSchema = z.discriminatedUnion('kind', [
  senseContentGrantSchema,
  resistancesContentGrantSchema,
  damageTypeContentGrantSchema,
  movementContentGrantSchema,
  weaponProficiencyContentGrantSchema,
  toolProficiencyContentGrantSchema,
  skillProficiencyContentGrantSchema,
  armorTrainingContentGrantSchema,
  languagesContentGrantSchema,
  languageChoiceContentGrantSchema,
  featChoiceContentGrantSchema,
  equipmentContentGrantSchema,
  spellsContentGrantSchema,
])

export type ContentGrant = z.infer<typeof contentGrantSchema>

// ---------------------------------------------------------------------------
// Grant groups — `{ unlock?, grants: ContentGrant[] }` wrappers
//
// The wrapper owns *when* grants are received; atomic grants own *what* and
// remain level-less. Unlock kind is implicit from container (see `contentGrantSchema`).
// ---------------------------------------------------------------------------

/**
 * When a set of grants unlocks. The `level` is in class levels for class/subclass
 * features and in character levels for species traits.
 *
 * Kept as an object (not a bare number) to allow future conditional unlock types.
 */
export const grantUnlockSchema = z.object({ level: absoluteLevelSchema })

export type GrantUnlock = z.infer<typeof grantUnlockSchema>

/**
 * A set of grants that unlock at the same time.
 * A group without `unlock` is the *default group* — granted when the trait/feature
 * is first gained: the feature level for class/subclass features; level 1 / when
 * the trait is gained for species traits.
 */
export const grantGroupSchema = z.object({
  unlock: grantUnlockSchema.optional(),
  grants: z.array(contentGrantSchema).min(1),
})

export type GrantGroup = z.infer<typeof grantGroupSchema>

/**
 * Canonical grant groups array. The stored shape must satisfy:
 * - At most one default group (no `unlock`).
 * - Unique unlock levels.
 * - Default group is the first element (if present), followed by ascending levels.
 *
 * Use {@link normalizeGrantGroups} to produce a canonical array before storing.
 */
export const grantGroupsSchema = z.array(grantGroupSchema).superRefine((groups, ctx) => {
  const defaultIndexes = groups.reduce<number[]>((acc, g, i) => {
    if (g.unlock === undefined) acc.push(i)
    return acc
  }, [])

  if (defaultIndexes.length > 1) {
    ctx.addIssue({
      code: 'custom',
      message: 'at most one default grant group (no unlock) is allowed',
    })
    return
  }

  if (defaultIndexes.length === 1 && defaultIndexes[0] !== 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'default grant group must be the first element',
    })
    return
  }

  const levelGroups = groups.filter((g) => g.unlock !== undefined)
  const levels = levelGroups.map((g) => g.unlock!.level)

  if (new Set(levels).size !== levels.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'grant group unlock levels must be unique',
    })
    return
  }

  for (let i = 1; i < levelGroups.length; i++) {
    if (levelGroups[i]!.unlock!.level <= levelGroups[i - 1]!.unlock!.level) {
      ctx.addIssue({
        code: 'custom',
        message: 'grant groups must be sorted in ascending unlock level order',
      })
      return
    }
  }
})

export type GrantGroups = z.infer<typeof grantGroupsSchema>

// ---------------------------------------------------------------------------
// Grant group helpers — single canonical iteration surface.
// Consumers never hand-roll group traversal; use these helpers.
// ---------------------------------------------------------------------------

/**
 * Normalises a grant groups array into the canonical stored shape:
 * - Strips groups with empty `grants` arrays (transient form state).
 * - Drops `unlock` when its level equals `parentUnlock.level` (e.g. the feature
 *   level for a class feature, or level 1 for a species trait), promoting those
 *   grants to the default group.
 * - Merges groups that share the same unlock level.
 * - Sorts: default group first, then ascending level.
 */
export function normalizeGrantGroups(
  groups: GrantGroup[],
  parentUnlock?: GrantUnlock,
): GrantGroup[] {
  const nonEmpty = groups.filter((g) => g.grants.length > 0)

  const normalized = nonEmpty.map((g): GrantGroup => {
    if (
      g.unlock !== undefined &&
      parentUnlock !== undefined &&
      g.unlock.level === parentUnlock.level
    ) {
      return { grants: g.grants }
    }
    return g
  })

  const byKey = new Map<'__default__' | number, ContentGrant[]>()
  for (const g of normalized) {
    const key: '__default__' | number = g.unlock?.level ?? '__default__'
    const existing = byKey.get(key) ?? []
    byKey.set(key, [...existing, ...g.grants])
  }

  const result: GrantGroup[] = []

  const defaultGrants = byKey.get('__default__')
  if (defaultGrants) {
    result.push({ grants: defaultGrants })
  }

  const levelEntries = (
    Array.from(byKey.entries()) as Array<['__default__' | number, ContentGrant[]]>
  )
    .filter((entry): entry is [number, ContentGrant[]] => typeof entry[0] === 'number')
    .sort(([a], [b]) => a - b)

  for (const [level, grants] of levelEntries) {
    result.push({ unlock: { level }, grants })
  }

  return result
}

/**
 * Flattens grant groups into a flat list of `{ grant, unlock? }` pairs.
 * Default-group grants produce entries with `unlock: undefined`.
 */
export function flattenGrantGroups(
  groups: GrantGroup[],
): Array<{ grant: ContentGrant; unlock?: GrantUnlock }> {
  return groups.flatMap((group) => group.grants.map((grant) => ({ grant, unlock: group.unlock })))
}

/**
 * Returns the effective unlock for a group: the group's own `unlock`, falling
 * back to `parentUnlock` for the default group (no `unlock`).
 */
export function getGrantGroupEffectiveUnlock(
  group: GrantGroup,
  parentUnlock?: GrantUnlock,
): GrantUnlock | undefined {
  return group.unlock ?? parentUnlock
}

/**
 * Returns all grants unlocked at or before `level`.
 * Default groups use `parentLevel` as their effective level
 * (feature level for class features; `1` for species traits).
 */
export function getUnlockedGrantsAtLevel(
  groups: GrantGroup[],
  level: number,
  parentLevel = 1,
): ContentGrant[] {
  return groups
    .filter((group) => {
      const effectiveLevel = group.unlock?.level ?? parentLevel
      return effectiveLevel <= level
    })
    .flatMap((group) => group.grants)
}

/**
 * Returns true when `grantGroups` is eligible for the `grant` trait kind in the
 * atomic model: exactly one default group (no `unlock`) containing exactly one
 * sense, resistances, movement, or languages grant.
 */
export function isGrantGroupsEligible(groups: GrantGroup[]): boolean {
  if (groups.length !== 1) return false
  const [group] = groups
  if (group!.unlock !== undefined) return false
  if (group!.grants.length !== 1) return false
  const kind = group!.grants[0]!.kind
  return kind === 'sense' || kind === 'resistances' || kind === 'movement' || kind === 'languages'
}

// --- Trait building block ---------------------------------------------------

export const CONTENT_TRAIT_KINDS = ['custom', 'grant'] as const

export const contentTraitKindSchema = z.enum(CONTENT_TRAIT_KINDS)

export type ContentTraitKind = z.infer<typeof contentTraitKindSchema>

/**
 * Named trait or feature: SRD prose plus optional structured grants (hybrids).
 * Class/subclass features always use this variant.
 *
 * Supports both the legacy `grants` bag and the new atomic `grantGroups` model.
 * New authoring uses `grantGroups`; the `grants` bag is preserved for catalog
 * backward compatibility until seeds are migrated.
 */
export const customContentTraitSchema = z.object({
  kind: z.literal('custom'),
  id: z.string().min(1), // unique within the parent record — enforced at the service layer
  name: z.string().min(1),
  /** Rich-text HTML faithful to the SRD wording (body only — no "Level N:" prefix). */
  description: z.string().optional(),
  /** @deprecated Use `grantGroups` for new authoring. */
  grants: contentGrantsSchema.optional(),
  /** Atomic grant groups — one group per unlock level. Replaces the `grants` bag. */
  grantGroups: grantGroupsSchema.optional(),
})

export type CustomContentTrait = z.infer<typeof customContentTraitSchema>

/**
 * Mechanics-only trait: display name and description are derived from `grantGroups`
 * unless overridden. The groups must pass {@link isGrantGroupsEligible}: exactly
 * one default group containing exactly one sense, resistance, movement bonus, or
 * language grant.
 */
export const grantContentTraitSchema = z
  .object({
    kind: z.literal('grant'),
    id: z.string().min(1),
    /** Atomic grant groups — the single source of truth for grant traits. */
    grantGroups: grantGroupsSchema,
    nameOverride: z.string().min(1).optional(),
    descriptionOverride: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (!isGrantGroupsEligible(val.grantGroups)) {
      ctx.addIssue({
        code: 'custom',
        message:
          'grant traits require a single atomic grant (one sense, resistance, movement bonus, or language)',
        path: ['grantGroups'],
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
