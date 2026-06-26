import type { CampaignSettings } from './campaign'
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
}

/** Standard max before any optional extended tier. */
export function resolveStandardMaxCharacterLevel(settings?: CampaignSettings): number {
  return settings?.ruleOverrides?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL
}

/** Creature types allowed on character sheets — sparse override or SRD default. */
export function resolveAllowedCharacterCreatureTypes(
  settings?: CampaignSettings,
): readonly CreatureTypeId[] {
  return (
    settings?.ruleOverrides?.allowedCharacterCreatureTypes ??
    DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES
  )
}

/** Effective max character level — extended cap when present, else standard max. */
export function resolveMaxCharacterLevel(settings?: CampaignSettings): number {
  const extended = settings?.ruleOverrides?.extendedProgression
  if (extended) return extended.maxLevel
  return resolveStandardMaxCharacterLevel(settings)
}

export function resolveCampaignRules(settings?: CampaignSettings): ResolvedCampaignRules {
  const standardMaxCharacterLevel = resolveStandardMaxCharacterLevel(settings)
  const allowedCharacterCreatureTypes = resolveAllowedCharacterCreatureTypes(settings)
  const storedExtended = settings?.ruleOverrides?.extendedProgression

  if (storedExtended) {
    return {
      maxCharacterLevel: storedExtended.maxLevel,
      standardMaxCharacterLevel,
      allowedCharacterCreatureTypes,
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

/** Grouped level options for authoring when extended progression is active. */
export function buildGroupedLevelOptions(rules: ResolvedCampaignRules): LevelOptionGroup[] {
  const { standardMaxCharacterLevel, extendedProgression, maxCharacterLevel } = rules

  if (!extendedProgression) {
    return [
      { label: `Levels 1–${maxCharacterLevel}`, options: buildLevelOptions(maxCharacterLevel) },
    ]
  }

  const standardOptions = buildLevelOptions(standardMaxCharacterLevel).map((option) => ({
    ...option,
    label: option.label.replace('Level ', ''),
  }))

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
