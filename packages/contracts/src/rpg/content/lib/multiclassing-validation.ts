import { formatSlugAsLabel } from '../../primitives/format-slug'
import { getAbilityLabel, type Ability } from '../../vocab/ability'
import { getContentTypeSentenceForm } from './content-type-terms'
import {
  DEFAULT_SPECIES_MULTICLASS_POLICY,
  type SpeciesLevelLimits,
  type SpeciesMulticlassing,
} from '../species-character-creation'

// ---------------------------------------------------------------------------
// Multiclassing validation — a pure eligibility check shared by the future
// character builder. Lives in `content/` alongside requirement-expression
// because it reasons about species/class content; the campaign rules are passed
// in structurally so this stays decoupled from the `platform/` layer (which the
// boundary lint forbids content from importing).
// ---------------------------------------------------------------------------

/**
 * Structural mirror of `ResolvedCampaignMulticlassingPatch` (platform layer).
 * Content cannot import platform, so we accept the shape structurally; a
 * co-located test asserts the platform type stays assignable to this.
 */
export type MulticlassingRulesInput = {
  enabled: boolean
  requirements: {
    primaryAbilityMinimum: { enabled: boolean; minimumScore: number }
    speciesPolicy: { enabled: boolean }
    speciesLevelLimits: { enabled: boolean }
  }
}

/** Minimal class shape the validator needs — `slug` matches species class references. */
export type MulticlassClass = {
  slug: string
  primaryAbilities: Ability[]
}

export type MulticlassCurrentClass = MulticlassClass & {
  level: number
}

export type MulticlassErrorCode =
  | 'multiclassing_disabled'
  | 'primary_ability_minimum'
  | 'species_policy_forbidden'
  | 'species_policy_class_not_allowed'
  | 'species_level_limit_character'
  | 'species_level_limit_class'

export type MulticlassError = {
  code: MulticlassErrorCode
  message: string
  ability?: Ability
  classSlug?: string
}

export type MulticlassValidationResult = {
  ok: boolean
  errors: MulticlassError[]
}

export type SpeciesMulticlassData = {
  multiclassing?: SpeciesMulticlassing
  levelLimits?: SpeciesLevelLimits
}

export type ValidateMulticlassInput = {
  rules: MulticlassingRulesInput
  /** The class the character wants to add or advance. */
  targetClass: MulticlassClass
  /** Classes the character already has, with their current levels. */
  currentClasses: MulticlassCurrentClass[]
  abilityScores: Record<Ability, number>
  species?: SpeciesMulticlassData
  /** Catalog class name lookup; defaults to {@link formatSlugAsLabel}. */
  resolveClassName?: (slug: string) => string
}

function resolveClassDisplayName(input: ValidateMulticlassInput, slug: string): string {
  return input.resolveClassName?.(slug) ?? formatSlugAsLabel(slug)
}

function collectRequiredAbilities(
  targetClass: MulticlassClass,
  currentClasses: MulticlassCurrentClass[],
): Ability[] {
  const abilities = new Set<Ability>()
  for (const ability of targetClass.primaryAbilities) abilities.add(ability)
  for (const cls of currentClasses) {
    for (const ability of cls.primaryAbilities) abilities.add(ability)
  }
  return [...abilities]
}

function checkPrimaryAbilityMinimum(
  input: ValidateMulticlassInput,
  minimumScore: number,
): MulticlassError[] {
  const required = collectRequiredAbilities(input.targetClass, input.currentClasses)

  return required
    .filter((ability) => (input.abilityScores[ability] ?? 0) < minimumScore)
    .map((ability) => ({
      code: 'primary_ability_minimum' as const,
      ability,
      message: `Requires ${getAbilityLabel(ability)} ${minimumScore} to multiclass (have ${
        input.abilityScores[ability] ?? 0
      }).`,
    }))
}

function checkSpeciesPolicy(input: ValidateMulticlassInput): MulticlassError[] {
  const policy = input.species?.multiclassing?.policy ?? DEFAULT_SPECIES_MULTICLASS_POLICY
  const targetSlug = input.targetClass.slug
  const className = resolveClassDisplayName(input, targetSlug)

  if (policy === 'forbidden') {
    return [
      {
        code: 'species_policy_forbidden',
        message: `This ${getContentTypeSentenceForm('species')} cannot multiclass.`,
      },
    ]
  }

  // `inherit` and `allowed` impose no class restriction; only `restricted` consults classPolicy.
  if (policy !== 'restricted') return []

  const classPolicy = input.species?.multiclassing?.classPolicy
  if (!classPolicy) return []

  const inList = classPolicy.classIds.includes(targetSlug)
  const blocked =
    (classPolicy.mode === 'only' && !inList) || (classPolicy.mode === 'all_except' && inList)

  if (!blocked) return []

  return [
    {
      code: 'species_policy_class_not_allowed',
      classSlug: targetSlug,
      message: `This ${getContentTypeSentenceForm('species')} cannot multiclass into ${className}.`,
    },
  ]
}

function checkSpeciesLevelLimits(input: ValidateMulticlassInput): MulticlassError[] {
  const levelLimits = input.species?.levelLimits
  if (!levelLimits) return []

  const errors: MulticlassError[] = []

  const currentCharacterLevel = input.currentClasses.reduce((sum, cls) => sum + cls.level, 0)
  const resultingCharacterLevel = currentCharacterLevel + 1

  if (
    levelLimits.maxCharacterLevel !== null &&
    resultingCharacterLevel > levelLimits.maxCharacterLevel
  ) {
    errors.push({
      code: 'species_level_limit_character',
      message: `This ${getContentTypeSentenceForm('species')} is limited to character level ${levelLimits.maxCharacterLevel}.`,
    })
  }

  const targetSlug = input.targetClass.slug
  const targetCurrentLevel = input.currentClasses.find((cls) => cls.slug === targetSlug)?.level ?? 0
  const resultingClassLevel = targetCurrentLevel + 1

  const cap = levelLimits.classLevelCaps.find((entry) => entry.classId === targetSlug)
  if (cap && resultingClassLevel > cap.maxLevel) {
    errors.push({
      code: 'species_level_limit_class',
      classSlug: targetSlug,
      message: `This ${getContentTypeSentenceForm('species')} limits ${resolveClassDisplayName(input, targetSlug)} to level ${cap.maxLevel}.`,
    })
  }

  return errors
}

/**
 * Validates whether a character may take a level in `targetClass`, applying only
 * the multiclassing requirements enabled by the campaign rules. Returns all
 * failures so the UI can surface every blocking reason at once.
 */
export function validateMulticlass(input: ValidateMulticlassInput): MulticlassValidationResult {
  if (!input.rules.enabled) {
    return {
      ok: false,
      errors: [
        {
          code: 'multiclassing_disabled',
          message: 'Multiclassing is disabled for this campaign.',
        },
      ],
    }
  }

  const { requirements } = input.rules
  const errors: MulticlassError[] = []

  if (requirements.primaryAbilityMinimum.enabled) {
    errors.push(
      ...checkPrimaryAbilityMinimum(input, requirements.primaryAbilityMinimum.minimumScore),
    )
  }

  if (requirements.speciesPolicy.enabled) {
    errors.push(...checkSpeciesPolicy(input))
  }

  if (requirements.speciesLevelLimits.enabled) {
    errors.push(...checkSpeciesLevelLimits(input))
  }

  return { ok: errors.length === 0, errors }
}
