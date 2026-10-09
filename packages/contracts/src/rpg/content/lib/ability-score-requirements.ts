import { z } from 'zod'

import { defineMessage, formatFieldMessage } from '../../../validation/define-message'
import { joinNaturalList } from '../../primitives/prose'
import {
  ABILITY_IDS,
  abilitySchema,
  abilityScoreSchema,
  getAbilityCompactLabel,
  type Ability,
} from '../../vocab/ability'

// ---------------------------------------------------------------------------
// Ability-score requirements — flat AND map of minimum scores authored on content
// (armor today). Feats keep `RequirementExpression`; both can share this comparator.
//
// Unknown scores: an ability with no score is skipped, so partially built drafts
// (picker browsing, live Review advisories) never warn before scores are assigned.
// Final creation cannot reach the advisory confirmation with unknown scores: the
// create gates run `finalSubmit` validation (which requires all six scores) before
// resolving advisories.
// ---------------------------------------------------------------------------

export const abilityScoreRequirementsSchema = z.partialRecord(abilitySchema, abilityScoreSchema)

export type AbilityScoreRequirements = z.infer<typeof abilityScoreRequirementsSchema>

export type AbilityScoreRequirement = {
  ability: Ability
  required: number
}

export type UnmetAbilityScoreRequirement = AbilityScoreRequirement & {
  actual: number
}

export const unmetAbilityScoreRequirementSchema = z.object({
  ability: abilitySchema,
  required: abilityScoreSchema,
  actual: abilityScoreSchema,
})

/** Requirements in `ABILITY_IDS` order. */
export function listAbilityScoreRequirements(
  requirements: AbilityScoreRequirements | undefined,
): AbilityScoreRequirement[] {
  if (!requirements) return []
  return ABILITY_IDS.flatMap((ability) => {
    const required = requirements[ability]
    return required === undefined ? [] : [{ ability, required }]
  })
}

/** Unmet requirements in `ABILITY_IDS` order. Meeting the minimum exactly counts as met. */
export function resolveUnmetAbilityScoreRequirements(
  requirements: AbilityScoreRequirements | undefined,
  scores: Partial<Record<Ability, number | null | undefined>> | undefined,
): UnmetAbilityScoreRequirement[] {
  return listAbilityScoreRequirements(requirements).flatMap((requirement) => {
    const actual = scores?.[requirement.ability]
    if (actual === undefined || actual === null) return []
    return actual < requirement.required ? [{ ...requirement, actual }] : []
  })
}

function formatAbilityScore(ability: Ability, score: number): string {
  return `${getAbilityCompactLabel(ability)} ${score}`
}

/** "Requires STR 15" */
export function formatAbilityScoreRequirementLabel(requirement: AbilityScoreRequirement): string {
  return `Requires ${formatAbilityScore(requirement.ability, requirement.required)}`
}

export const abilityScoreRequirementMessages = {
  unmet: defineMessage(
    'validation.abilityScoreRequirement.unmet',
    (params: { required: string; actual: string }) =>
      `Requires ${params.required}; character has ${params.actual}.`,
  ),
}

/** "Requires STR 15 and DEX 13; character has STR 12 and DEX 10." */
export function formatUnmetAbilityScoreRequirementsDetail(
  unmet: readonly UnmetAbilityScoreRequirement[],
): string {
  if (unmet.length === 0) return ''
  return formatFieldMessage(
    abilityScoreRequirementMessages.unmet({
      required: joinNaturalList(
        unmet.map((entry) => formatAbilityScore(entry.ability, entry.required)),
      ),
      actual: joinNaturalList(
        unmet.map((entry) => formatAbilityScore(entry.ability, entry.actual)),
      ),
    }),
  )
}

/** Compact restriction copy for catalog chrome: "STR 15 required". */
export function formatAbilityScoreRequirementsRestriction(
  requirements: AbilityScoreRequirements | undefined,
): string | undefined {
  const entries = listAbilityScoreRequirements(requirements)
  if (entries.length === 0) return undefined
  return `${joinNaturalList(entries.map((entry) => formatAbilityScore(entry.ability, entry.required)))} required`
}
