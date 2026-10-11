import { ABILITY_IDS, getAbilityCompactLabel } from '@rpg/contracts'

import {
  MONSTER_ABILITY_SCORES_HEADING,
  MONSTER_ARMOR_CLASS_HEADING,
  MONSTER_HIT_POINTS_HEADING,
} from './monster-form-labels'

const SECTION_LABELS: Record<string, string> = {
  armorClass: MONSTER_ARMOR_CLASS_HEADING,
  hitPoints: MONSTER_HIT_POINTS_HEADING,
}

const STATISTICS_ERROR_PREFIXES = [
  'abilityScores',
  'armorClass',
  'hitPoints',
  'proficiencies.savingThrows',
] as const

export type StatisticsFieldIssue = {
  path: string
  message: string
}

/** Issues whose paths belong to the statistics tab. */
export function statisticsIssuesForDisplay(
  issues: readonly StatisticsFieldIssue[],
): StatisticsFieldIssue[] {
  const seen = new Set<string>()
  const next: StatisticsFieldIssue[] = []
  for (const issue of issues) {
    if (!issue.path || !issue.message || seen.has(issue.path)) continue
    const owned = STATISTICS_ERROR_PREFIXES.some(
      (prefix) => issue.path === prefix || issue.path.startsWith(`${prefix}.`),
    )
    if (!owned) continue
    seen.add(issue.path)
    next.push(issue)
  }
  return next
}

/** True when `path` is the issue, contains it, or sits inside it. */
export function statisticsFieldIsInvalid(
  issues: readonly StatisticsFieldIssue[],
  path: string,
): boolean {
  return issues.some(
    (issue) =>
      issue.path === path || issue.path.startsWith(`${path}.`) || path.startsWith(`${issue.path}.`),
  )
}

function abilityIssueLabel(path: string): string {
  const ability = path.split('.')[1]
  if (ability && (ABILITY_IDS as readonly string[]).includes(ability)) {
    return getAbilityCompactLabel(ability)
  }
  return MONSTER_ABILITY_SCORES_HEADING
}

export function statisticsIssueLabel(path: string): string {
  const root = path.split('.')[0] ?? path
  if (root === 'abilityScores') return abilityIssueLabel(path)
  if (root === 'proficiencies') return 'Saving throw'
  return SECTION_LABELS[root] ?? path
}
