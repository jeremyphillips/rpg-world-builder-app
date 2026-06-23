import {
  ABILITY_SCORE_MAX,
  ABILITY_SCORE_MIN,
  levelSchema,
  type RequirementAbilityMinimum,
  type RequirementExpression,
} from '@rpg/contracts'
import type { RefinementCtx } from 'zod'

export const FEAT_PREREQUISITE_PATTERNS = [
  'none',
  'min-level',
  'feature',
  'level-and-abilities',
  'level-and-spellcasting',
] as const

export type FeatPrerequisitePattern = (typeof FEAT_PREREQUISITE_PATTERNS)[number]

export type FeatPrerequisiteFormFields = {
  prerequisitePattern: FeatPrerequisitePattern
  prerequisiteMinLevel?: number
  prerequisiteFeatureId?: string
  prerequisiteAbilities?: Array<RequirementAbilityMinimum['ability']>
  prerequisiteAbilityMinimum?: number
}

type FeatFormRefinementValues = FeatPrerequisiteFormFields & {
  repeatableAllowed: boolean
  repeatableNotes?: string
}

function addCustomIssue(ctx: RefinementCtx, path: string[], message: string): void {
  ctx.addIssue({ code: 'custom', message, path })
}

function isValidLevel(level: unknown): boolean {
  return levelSchema.safeParse(level).success
}

function isValidAbilityMinimum(minimum: number | undefined): boolean {
  return minimum !== undefined && minimum >= ABILITY_SCORE_MIN && minimum <= ABILITY_SCORE_MAX
}

function validateRepeatableNotes(values: FeatFormRefinementValues, ctx: RefinementCtx): void {
  if (!values.repeatableAllowed && values.repeatableNotes?.trim()) {
    addCustomIssue(
      ctx,
      ['repeatableNotes'],
      'Repeat constraints are only allowed when the feat is repeatable',
    )
  }
}

function validateRequiredMinLevel(level: unknown, ctx: RefinementCtx): void {
  if (!isValidLevel(level)) {
    addCustomIssue(ctx, ['prerequisiteMinLevel'], 'Minimum character level is required')
  }
}

function validateFeaturePattern(values: FeatPrerequisiteFormFields, ctx: RefinementCtx): void {
  if (!values.prerequisiteFeatureId?.trim()) {
    addCustomIssue(ctx, ['prerequisiteFeatureId'], 'Feature ID is required')
  }
}

function validateLevelAndAbilitiesPattern(
  values: FeatPrerequisiteFormFields,
  ctx: RefinementCtx,
): void {
  validateRequiredMinLevel(values.prerequisiteMinLevel, ctx)

  if (!values.prerequisiteAbilities?.length) {
    addCustomIssue(ctx, ['prerequisiteAbilities'], 'Select at least one ability score')
  }

  if (!isValidAbilityMinimum(values.prerequisiteAbilityMinimum)) {
    addCustomIssue(
      ctx,
      ['prerequisiteAbilityMinimum'],
      `Minimum score must be between ${ABILITY_SCORE_MIN} and ${ABILITY_SCORE_MAX}`,
    )
  }
}

const PREREQUISITE_PATTERN_VALIDATORS: Record<
  Exclude<FeatPrerequisitePattern, 'none'>,
  (values: FeatPrerequisiteFormFields, ctx: RefinementCtx) => void
> = {
  'min-level': (values, ctx) => validateRequiredMinLevel(values.prerequisiteMinLevel, ctx),
  feature: validateFeaturePattern,
  'level-and-abilities': validateLevelAndAbilitiesPattern,
  'level-and-spellcasting': (values, ctx) =>
    validateRequiredMinLevel(values.prerequisiteMinLevel, ctx),
}

function validatePrerequisitePattern(values: FeatPrerequisiteFormFields, ctx: RefinementCtx): void {
  if (values.prerequisitePattern === 'none') return
  PREREQUISITE_PATTERN_VALIDATORS[values.prerequisitePattern](values, ctx)
}

/** Zod superRefine hook for feat prerequisite and repeatable fields. */
export function refineFeatPrerequisiteFields(
  values: FeatFormRefinementValues,
  ctx: RefinementCtx,
): void {
  validateRepeatableNotes(values, ctx)
  validatePrerequisitePattern(values, ctx)
}

/** Maps validated form prerequisite fields to a RequirementExpression tree. */
export function prerequisiteFromFormValues(
  values: FeatPrerequisiteFormFields,
): RequirementExpression | undefined {
  switch (values.prerequisitePattern) {
    case 'none':
      return undefined
    case 'min-level':
      return { kind: 'minLevel', level: levelSchema.parse(values.prerequisiteMinLevel) }
    case 'feature':
      return { kind: 'feature', featureId: values.prerequisiteFeatureId!.trim() }
    case 'level-and-abilities':
      return {
        kind: 'all',
        requirements: [
          { kind: 'minLevel', level: levelSchema.parse(values.prerequisiteMinLevel) },
          {
            kind: 'any',
            requirements: values.prerequisiteAbilities!.map((ability) => ({
              kind: 'abilityMinimum' as const,
              ability,
              minimum: values.prerequisiteAbilityMinimum!,
            })),
          },
        ],
      }
    case 'level-and-spellcasting':
      return {
        kind: 'all',
        requirements: [
          { kind: 'minLevel', level: levelSchema.parse(values.prerequisiteMinLevel) },
          { kind: 'spellcasting' },
        ],
      }
  }
}

function parseMinLevelPrerequisite(
  prerequisite: Extract<RequirementExpression, { kind: 'minLevel' }>,
): FeatPrerequisiteFormFields {
  return {
    prerequisitePattern: 'min-level',
    prerequisiteMinLevel: prerequisite.level,
  }
}

function parseFeaturePrerequisite(
  prerequisite: Extract<RequirementExpression, { kind: 'feature' }>,
): FeatPrerequisiteFormFields {
  return {
    prerequisitePattern: 'feature',
    prerequisiteFeatureId: prerequisite.featureId,
  }
}

function parseLevelAndSpellcastingPair(
  first: RequirementExpression,
  second: RequirementExpression,
): FeatPrerequisiteFormFields | undefined {
  if (first.kind !== 'minLevel' || second.kind !== 'spellcasting') return undefined
  return {
    prerequisitePattern: 'level-and-spellcasting',
    prerequisiteMinLevel: first.level,
  }
}

function parseLevelAndAbilitiesPair(
  first: RequirementExpression,
  second: RequirementExpression,
): FeatPrerequisiteFormFields | undefined {
  if (first.kind !== 'minLevel' || second.kind !== 'any') return undefined

  const abilityMins = second.requirements.filter((req) => req.kind === 'abilityMinimum')
  if (abilityMins.length === 0) return undefined

  const minimum = abilityMins[0]!.minimum
  if (!abilityMins.every((req) => req.minimum === minimum)) return undefined

  return {
    prerequisitePattern: 'level-and-abilities',
    prerequisiteMinLevel: first.level,
    prerequisiteAbilities: abilityMins.map((req) => req.ability),
    prerequisiteAbilityMinimum: minimum,
  }
}

function parseAllPrerequisite(
  prerequisite: Extract<RequirementExpression, { kind: 'all' }>,
): FeatPrerequisiteFormFields | undefined {
  if (prerequisite.requirements.length !== 2) return undefined

  const [first, second] = prerequisite.requirements
  return (
    parseLevelAndSpellcastingPair(first!, second!) ?? parseLevelAndAbilitiesPair(first!, second!)
  )
}

/** Maps a stored prerequisite tree to form fields for the v1 pattern editor. */
export function prerequisiteToFormValues(
  prerequisite?: RequirementExpression,
): FeatPrerequisiteFormFields {
  if (!prerequisite) {
    return { prerequisitePattern: 'none' }
  }

  if (prerequisite.kind === 'minLevel') {
    return parseMinLevelPrerequisite(prerequisite)
  }

  if (prerequisite.kind === 'feature') {
    return parseFeaturePrerequisite(prerequisite)
  }

  if (prerequisite.kind === 'all') {
    return parseAllPrerequisite(prerequisite) ?? { prerequisitePattern: 'none' }
  }

  return { prerequisitePattern: 'none' }
}
