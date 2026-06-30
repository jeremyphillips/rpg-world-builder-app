import { z } from 'zod'

import { formatSlugAsLabel } from '../../primitives/format-slug'
import { absoluteLevelSchema } from '../../primitives/level'
import {
  ABILITY_SCORE_MAX,
  ABILITY_SCORE_MIN,
  abilitySchema,
  getAbilityLabel,
  type Ability,
} from '../../vocab/ability'

import { classSlugSchema } from '../class/class'

// ---------------------------------------------------------------------------
// RequirementExpression — composable AND/OR eligibility trees shared by feats,
// future invocations, multiclass rules, and the character builder.
//
// Semantics:
// - `all` — every child must be satisfied (AND).
// - `any` — at least one child must be satisfied (OR).
// - A single leaf is valid at the root (no forced `all` wrapper).
//
// The `feature` leaf may be removed once invocation/multiclass needs are clearer.
// Feat eligibility tied to class features uses grants.featChoice on the source.
// ---------------------------------------------------------------------------

export const requirementMinLevelSchema = z.object({
  kind: z.literal('minLevel'),
  level: absoluteLevelSchema,
})

export const requirementAbilityMinimumSchema = z.object({
  kind: z.literal('abilityMinimum'),
  ability: abilitySchema,
  minimum: z.number().int().min(ABILITY_SCORE_MIN).max(ABILITY_SCORE_MAX),
})

export const requirementClassLevelSchema = z.object({
  kind: z.literal('classLevel'),
  classSlug: classSlugSchema,
  minimum: z.number().int().min(1).default(1),
})

export const requirementFeatureSchema = z.object({
  kind: z.literal('feature'),
  featureId: z.string().min(1),
})

export const requirementSpellcastingSchema = z.object({
  kind: z.literal('spellcasting'),
})

export type RequirementMinLevel = z.infer<typeof requirementMinLevelSchema>
export type RequirementAbilityMinimum = z.infer<typeof requirementAbilityMinimumSchema>
export type RequirementClassLevel = z.infer<typeof requirementClassLevelSchema>
export type RequirementFeature = z.infer<typeof requirementFeatureSchema>
export type RequirementSpellcasting = z.infer<typeof requirementSpellcastingSchema>

export type RequirementExpression =
  | RequirementMinLevel
  | RequirementAbilityMinimum
  | RequirementClassLevel
  | RequirementFeature
  | RequirementSpellcasting
  | { kind: 'all'; requirements: RequirementExpression[] }
  | { kind: 'any'; requirements: RequirementExpression[] }

export const requirementExpressionSchema: z.ZodType<RequirementExpression> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('all'),
      requirements: z.array(requirementExpressionSchema).min(1),
    }),
    z.object({
      kind: z.literal('any'),
      requirements: z.array(requirementExpressionSchema).min(1),
    }),
    requirementMinLevelSchema,
    requirementAbilityMinimumSchema,
    requirementClassLevelSchema,
    requirementFeatureSchema,
    requirementSpellcastingSchema,
  ]),
)

/** Title-cases a kebab-case feature id for display (e.g. `fighting-style` → `Fighting Style Feature`). */
export function formatFeatureRequirement(featureId: string): string {
  const label = featureId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
  return `${label} Feature`
}

export type FormatRequirementExpressionOptions = {
  /** Full ability name (default) or uppercase id (`STR`). */
  abilityDisplay?: 'label' | 'id'
  /** Catalog class name lookup; defaults to {@link formatSlugAsLabel}. */
  resolveClassName?: (slug: string) => string
}

function formatAbilityReference(
  ability: Ability,
  abilityDisplay: NonNullable<FormatRequirementExpressionOptions['abilityDisplay']>,
): string {
  return abilityDisplay === 'id' ? ability.toUpperCase() : getAbilityLabel(ability)
}

function formatAnyGroup(
  requirements: RequirementExpression[],
  options: FormatRequirementExpressionOptions,
): string {
  const abilityDisplay = options.abilityDisplay ?? 'label'
  const abilityMins = requirements.filter(
    (req): req is RequirementAbilityMinimum => req.kind === 'abilityMinimum',
  )
  if (abilityMins.length === requirements.length && abilityMins.length > 0) {
    const { minimum } = abilityMins[0]!
    if (abilityMins.every((req) => req.minimum === minimum)) {
      const labels = abilityMins
        .map((req) => formatAbilityReference(req.ability, abilityDisplay))
        .join(' or ')
      return `${labels} ${minimum}+`
    }
  }
  return requirements.map((req) => formatRequirementExpression(req, options)).join(' or ')
}

/** Formats a requirement tree as player-facing prerequisite prose. */
export function formatRequirementExpression(
  expr: RequirementExpression,
  options: FormatRequirementExpressionOptions = {},
): string {
  const abilityDisplay = options.abilityDisplay ?? 'label'
  switch (expr.kind) {
    case 'all':
      return expr.requirements.map((req) => formatRequirementExpression(req, options)).join(', ')
    case 'any':
      return formatAnyGroup(expr.requirements, options)
    case 'minLevel':
      return `Level ${expr.level}+`
    case 'abilityMinimum':
      return `${formatAbilityReference(expr.ability, abilityDisplay)} ${expr.minimum}+`
    case 'classLevel': {
      const resolveClassName = options.resolveClassName ?? formatSlugAsLabel
      return `${resolveClassName(expr.classSlug)} level ${expr.minimum}+`
    }
    case 'feature':
      return formatFeatureRequirement(expr.featureId)
    case 'spellcasting':
      return 'Spellcasting Feature'
  }
}
