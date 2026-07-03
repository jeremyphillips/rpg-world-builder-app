import type {
  CampaignCharacterCreationPatch,
  CreatureTypePolicy,
} from './patches/campaign-character-creation-patch'
import {
  resolveMulticlassingRules,
  type ResolvedCampaignMulticlassingPatch,
} from './patches/campaign-multiclassing-patch'
import {
  resolveSubclassingRules,
  type ResolvedCampaignSubclassingPatch,
} from './patches/campaign-subclassing-patch'
import type { CreatureTypeId } from '../vocab/creature-type'
import {
  ABSOLUTE_MAX_CHARACTER_LEVEL,
  buildLevelOptions,
  DEFAULT_EXTENDED_LEVEL_OFFSET,
  MAX_CHARACTER_LEVEL,
  type LevelOptionGroup,
} from '../primitives/level'

export {
  validateExtendedMaxLevel,
  type ExtendedMaxValidationResult,
} from './campaign-level-validation'

/** Default creature types allowed on character sheets (PC and NPC). */
export const DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES = [
  'humanoid',
] as const satisfies readonly CreatureTypeId[]

export type ResolvedExtendedProgression = {
  tierName: string
  startsAt: number
  maxLevel: number
}

export type ResolvedCampaignRules = {
  /** Effective cap for forms, validation, and content authoring. */
  maxCharacterLevel: number
  /** Standard tier separator point (sparse override or 20). */
  standardMaxCharacterLevel: number
  /** Creature types allowed on character sheets in this campaign. */
  allowedCharacterCreatureTypes: readonly CreatureTypeId[]
  extendedProgression?: ResolvedExtendedProgression
  /** Resolved multiclassing rules for content authoring and validation gating. */
  multiclassing: ResolvedCampaignMulticlassingPatch
  /** Resolved subclass choice rules for character-builder and content display gating. */
  subclassing: ResolvedCampaignSubclassingPatch
}

/** Standard max before any optional extended tier. */
export function resolveStandardMaxCharacterLevel(patch?: CampaignCharacterCreationPatch): number {
  return patch?.progression?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL
}

/** Resolves allowed creature type ids from a species creature-type policy. */
export function resolveAllowedCreatureTypesFromPolicy(
  policy?: CreatureTypePolicy,
): readonly CreatureTypeId[] {
  if (!policy) return DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES
  if (policy.mode === 'only') return policy.ids
  return DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES
}

/** Creature types allowed on character sheets — sparse policy or SRD default. */
export function resolveAllowedCharacterCreatureTypes(
  patch?: CampaignCharacterCreationPatch,
): readonly CreatureTypeId[] {
  return resolveAllowedCreatureTypesFromPolicy(patch?.species?.creatureTypePolicy)
}

/** Effective max character level — extended cap when present, else standard max. */
export function resolveMaxCharacterLevel(patch?: CampaignCharacterCreationPatch): number {
  const extended = patch?.progression?.extendedProgression
  if (extended) return extended.maxLevel
  return resolveStandardMaxCharacterLevel(patch)
}

export function resolveCampaignRules(
  patch?: CampaignCharacterCreationPatch,
): ResolvedCampaignRules {
  const standardMaxCharacterLevel = resolveStandardMaxCharacterLevel(patch)
  const allowedCharacterCreatureTypes = resolveAllowedCharacterCreatureTypes(patch)
  const storedExtended = patch?.progression?.extendedProgression
  const multiclassing = resolveMulticlassingRules(patch?.multiclassing)
  const subclassing = resolveSubclassingRules(patch?.subclasses)

  if (storedExtended) {
    return {
      maxCharacterLevel: storedExtended.maxLevel,
      standardMaxCharacterLevel,
      allowedCharacterCreatureTypes,
      multiclassing,
      subclassing,
      extendedProgression: {
        tierName: storedExtended.tierName,
        startsAt: standardMaxCharacterLevel + 1,
        maxLevel: storedExtended.maxLevel,
      },
    }
  }

  return {
    maxCharacterLevel: standardMaxCharacterLevel,
    standardMaxCharacterLevel,
    allowedCharacterCreatureTypes,
    multiclassing,
    subclassing,
  }
}

export type LevelRangeSummaryInput = {
  maxCharacterLevel: number
  extendedTierName?: string
  extendedMaxLevel?: number
}

/** Inline range when extended progression is off. */
export function formatStandardLevelRange(standardMax: number): string {
  return `Range: 1–${standardMax}`
}

/** Inline range when extended progression is on. */
export function formatExtendedLevelRange(input: LevelRangeSummaryInput): string {
  const standardMax = input.maxCharacterLevel
  const extendedMax = input.extendedMaxLevel ?? standardMax + DEFAULT_EXTENDED_LEVEL_OFFSET
  const tierLabel = input.extendedTierName?.trim() || 'extended'
  return `Range: 1–${standardMax} standard · ${standardMax + 1}–${extendedMax} ${tierLabel}`
}

/** Default extended max when the user enables extended progression. */
export function defaultExtendedMaxLevel(standardMax: number): number {
  return Math.min(standardMax + DEFAULT_EXTENDED_LEVEL_OFFSET, ABSOLUTE_MAX_CHARACTER_LEVEL)
}

export type BuildGroupedLevelOptionsConfig = {
  /** When false, return one flat group without standard/extended tier headers. Default true. */
  showTierLabels?: boolean
}

/** Grouped level options for authoring when extended progression is active. */
export function buildGroupedLevelOptions(
  rules: ResolvedCampaignRules,
  config: BuildGroupedLevelOptionsConfig = {},
): LevelOptionGroup[] {
  const { standardMaxCharacterLevel, extendedProgression, maxCharacterLevel } = rules
  const showTierLabels = config.showTierLabels ?? true

  if (!extendedProgression || !showTierLabels) {
    return [{ label: '', options: buildLevelOptions(maxCharacterLevel) }]
  }

  const standardOptions = buildLevelOptions(standardMaxCharacterLevel)
  const extendedCount = maxCharacterLevel - standardMaxCharacterLevel
  const extendedOptions = Array.from({ length: extendedCount }, (_, index) => {
    const level = standardMaxCharacterLevel + index + 1
    return { value: String(level), label: String(level) }
  })

  return [
    {
      label: `Levels 1–${standardMaxCharacterLevel}`,
      options: standardOptions,
    },
    {
      label: `${extendedProgression.tierName} Tier (${extendedProgression.startsAt}–${extendedProgression.maxLevel})`,
      options: extendedOptions,
    },
  ]
}
