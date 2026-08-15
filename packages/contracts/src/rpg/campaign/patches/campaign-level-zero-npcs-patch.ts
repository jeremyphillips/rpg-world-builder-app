import { z } from 'zod'

import {
  characterWealthGrantSchema,
  normalizeCharacterWealthGrant,
  type CharacterWealthGrant,
} from '../../primitives/character-wealth-grant'
import { hitDieSchema, type HitDie } from '../../primitives/dice'
import { languageProficiencyGrantSetSchema } from '../../primitives/proficiency/proficiency-grant-set'
import {
  armorProficiencyGrantSetSchema,
  weaponProficiencyGrantSetSchema,
  type ArmorProficiencyGrantSet,
} from '../../primitives/proficiency/typed-proficiency-grant-set'

// ---------------------------------------------------------------------------
// Level 0 NPCs — campaign-configurable baseline for commoner-grade NPCs.
// Stored sparse under `characterCreation.levelZeroNpcs`; resolved via
// `resolveLevelZeroNpcRules` (canonical consumer boundary).
// ---------------------------------------------------------------------------

export const DEFAULT_LEVEL_ZERO_NPCS_ENABLED = true

export const DEFAULT_LEVEL_ZERO_BASE_HIT_DIE = 6 as const satisfies HitDie

export const DEFAULT_LEVEL_ZERO_PROFICIENCY_BONUS = 2

export const DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_TRAITS = true

export const DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_LANGUAGES = true

export const DEFAULT_LEVEL_ZERO_EMPTY_GRANT = {
  categories: [],
  items: [],
} as const satisfies Pick<ArmorProficiencyGrantSet, 'categories' | 'items'>

export const DEFAULT_LEVEL_ZERO_LANGUAGE_PROFICIENCIES = {
  items: ['common'],
  categories: [],
} as const

const XOR_GRANT_SET_MESSAGE = 'Grant set cannot include both categories and specific items'

export const levelZeroArmorGrantSchema = armorProficiencyGrantSetSchema.refine(
  (value) => !(value.categories.length > 0 && value.items.length > 0),
  { message: XOR_GRANT_SET_MESSAGE },
)

export const levelZeroWeaponGrantSchema = weaponProficiencyGrantSetSchema.refine(
  (value) => !(value.categories.length > 0 && value.items.length > 0),
  { message: XOR_GRANT_SET_MESSAGE },
)

export const levelZeroProficiencyBonusSchema = z.union([z.literal(0), z.literal(1), z.literal(2)])

export type LevelZeroProficiencyBonus = z.infer<typeof levelZeroProficiencyBonusSchema>

// ---------------------------------------------------------------------------
// Sparse stored shape
// ---------------------------------------------------------------------------

/** Sparse level 0 NPC patch stored under `characterCreation.levelZeroNpcs`. */
export const campaignLevelZeroNpcsPatchSchema = z
  .object({
    enabled: z.boolean().optional(),
    baseHitDie: hitDieSchema.optional(),
    proficiencyBonus: levelZeroProficiencyBonusSchema.optional(),
    retainSpeciesTraits: z.boolean().optional(),
    armorProficiencies: levelZeroArmorGrantSchema.optional(),
    weaponProficiencies: levelZeroWeaponGrantSchema.optional(),
    languageProficiencies: languageProficiencyGrantSetSchema.optional(),
    retainSpeciesLanguages: z.boolean().optional(),
    startingWealth: characterWealthGrantSchema.optional(),
  })
  .strict()

export type CampaignLevelZeroNpcsPatch = z.infer<typeof campaignLevelZeroNpcsPatchSchema>

// ---------------------------------------------------------------------------
// Resolved shape (campaign defaults applied)
// ---------------------------------------------------------------------------

export const resolvedCampaignLevelZeroNpcsPatchSchema = z.object({
  enabled: z.boolean(),
  baseHitDie: hitDieSchema,
  proficiencyBonus: levelZeroProficiencyBonusSchema,
  retainSpeciesTraits: z.boolean(),
  armorProficiencies: levelZeroArmorGrantSchema,
  weaponProficiencies: levelZeroWeaponGrantSchema,
  languageProficiencies: languageProficiencyGrantSetSchema,
  retainSpeciesLanguages: z.boolean(),
  startingWealth: characterWealthGrantSchema.optional(),
})

export type ResolvedCampaignLevelZeroNpcsPatch = z.infer<
  typeof resolvedCampaignLevelZeroNpcsPatchSchema
>

// ---------------------------------------------------------------------------
// Resolver + helpers
// ---------------------------------------------------------------------------

function resolveLevelZeroArmorProficiencies(
  patch?: CampaignLevelZeroNpcsPatch['armorProficiencies'],
): ResolvedCampaignLevelZeroNpcsPatch['armorProficiencies'] {
  return levelZeroArmorGrantSchema.parse(patch ?? DEFAULT_LEVEL_ZERO_EMPTY_GRANT)
}

function resolveLevelZeroWeaponProficiencies(
  patch?: CampaignLevelZeroNpcsPatch['weaponProficiencies'],
): ResolvedCampaignLevelZeroNpcsPatch['weaponProficiencies'] {
  return levelZeroWeaponGrantSchema.parse(patch ?? DEFAULT_LEVEL_ZERO_EMPTY_GRANT)
}

function resolveLevelZeroLanguageProficiencies(
  patch?: CampaignLevelZeroNpcsPatch['languageProficiencies'],
): ResolvedCampaignLevelZeroNpcsPatch['languageProficiencies'] {
  return languageProficiencyGrantSetSchema.parse(patch ?? DEFAULT_LEVEL_ZERO_LANGUAGE_PROFICIENCIES)
}

function resolveLevelZeroStartingWealth(
  patch?: CampaignLevelZeroNpcsPatch['startingWealth'],
): CharacterWealthGrant | undefined {
  return normalizeCharacterWealthGrant(patch)
}

/** Default level 0 NPC rules for new campaigns before any explicit patch is stored. */
export function defaultLevelZeroNpcRules(): ResolvedCampaignLevelZeroNpcsPatch {
  return {
    enabled: DEFAULT_LEVEL_ZERO_NPCS_ENABLED,
    baseHitDie: DEFAULT_LEVEL_ZERO_BASE_HIT_DIE,
    proficiencyBonus: DEFAULT_LEVEL_ZERO_PROFICIENCY_BONUS,
    retainSpeciesTraits: DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_TRAITS,
    armorProficiencies: resolveLevelZeroArmorProficiencies(),
    weaponProficiencies: resolveLevelZeroWeaponProficiencies(),
    languageProficiencies: resolveLevelZeroLanguageProficiencies(),
    retainSpeciesLanguages: DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_LANGUAGES,
    startingWealth: undefined,
  }
}

/** Applies campaign defaults to a sparse level 0 NPC patch. */
export function resolveLevelZeroNpcRules(
  patch?: CampaignLevelZeroNpcsPatch,
): ResolvedCampaignLevelZeroNpcsPatch {
  const defaults = defaultLevelZeroNpcRules()
  if (!patch) return defaults

  return {
    enabled: patch.enabled ?? defaults.enabled,
    baseHitDie: patch.baseHitDie ?? defaults.baseHitDie,
    proficiencyBonus: patch.proficiencyBonus ?? defaults.proficiencyBonus,
    retainSpeciesTraits: patch.retainSpeciesTraits ?? defaults.retainSpeciesTraits,
    armorProficiencies: resolveLevelZeroArmorProficiencies(patch.armorProficiencies),
    weaponProficiencies: resolveLevelZeroWeaponProficiencies(patch.weaponProficiencies),
    languageProficiencies: resolveLevelZeroLanguageProficiencies(patch.languageProficiencies),
    retainSpeciesLanguages: patch.retainSpeciesLanguages ?? defaults.retainSpeciesLanguages,
    startingWealth: resolveLevelZeroStartingWealth(patch.startingWealth),
  }
}

function isDefaultLevelZeroGrantSet(grant: {
  categories: readonly string[]
  items: readonly string[]
}): boolean {
  return grant.categories.length === 0 && grant.items.length === 0
}

function isDefaultLevelZeroLanguageProficiencies(grant: {
  categories: readonly string[]
  items: readonly string[]
}): boolean {
  return (
    grant.categories.length === 0 &&
    grant.items.length === DEFAULT_LEVEL_ZERO_LANGUAGE_PROFICIENCIES.items.length &&
    grant.items.every(
      (item, index) => item === DEFAULT_LEVEL_ZERO_LANGUAGE_PROFICIENCIES.items[index],
    )
  )
}

/** True when a patch resolves to pure defaults — lets the API drop the stored group. */
export function isSparseDefaultLevelZeroNpcsPatch(patch?: CampaignLevelZeroNpcsPatch): boolean {
  const resolved = resolveLevelZeroNpcRules(patch)

  return (
    resolved.enabled === DEFAULT_LEVEL_ZERO_NPCS_ENABLED &&
    resolved.baseHitDie === DEFAULT_LEVEL_ZERO_BASE_HIT_DIE &&
    resolved.proficiencyBonus === DEFAULT_LEVEL_ZERO_PROFICIENCY_BONUS &&
    resolved.retainSpeciesTraits === DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_TRAITS &&
    isDefaultLevelZeroGrantSet(resolved.armorProficiencies) &&
    isDefaultLevelZeroGrantSet(resolved.weaponProficiencies) &&
    isDefaultLevelZeroLanguageProficiencies(resolved.languageProficiencies) &&
    resolved.retainSpeciesLanguages === DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_LANGUAGES &&
    resolved.startingWealth === undefined
  )
}

export { normalizeCharacterWealthGrant }
