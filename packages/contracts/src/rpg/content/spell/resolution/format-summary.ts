import {
  formatResolutionDamage,
  formatResolutionHealing,
  formatResolutionTemporaryHitPoints,
} from './format-effect-lines'
import { formatResolutionMethod } from './format-method'
import { formatResolutionProjectilesPreview } from './format-application-pattern'
import { formatResolutionOutcomes } from './format-outcomes'
import { formatResolutionTarget } from './format-target'
import type { SpellResolution } from './schema'

export type SpellResolutionSummarySection = {
  heading: string
  lines: string[]
}

/** Structured summary sections for preview panels. */
export function formatResolutionSummarySections(
  resolution: SpellResolution,
): SpellResolutionSummarySection[] {
  const sections: SpellResolutionSummarySection[] = [
    { heading: 'Target', lines: [formatResolutionTarget(resolution)] },
    {
      heading: 'Check',
      lines: [formatResolutionMethod(resolution, 'resolution-preview')],
    },
  ]

  if (resolution.applicationPattern?.kind === 'projectiles') {
    sections.push({
      heading: 'Projectiles',
      lines: [formatResolutionProjectilesPreview(resolution.applicationPattern)],
    })
  }

  const damageLine = formatResolutionDamage(resolution)
  if (damageLine) {
    sections.push({ heading: 'Damage', lines: [damageLine] })
  }

  const healingLine = formatResolutionHealing(resolution)
  if (healingLine) {
    sections.push({ heading: 'Healing', lines: [healingLine] })
  }

  const temporaryHitPointsLine = formatResolutionTemporaryHitPoints(resolution)
  if (temporaryHitPointsLine) {
    sections.push({ heading: 'Temporary hit points', lines: [temporaryHitPointsLine] })
  }

  const outcomeLines = formatResolutionOutcomes(resolution)
  if (outcomeLines.length > 0) {
    sections.push({
      heading: outcomeLines.length === 1 ? 'Outcome' : 'Outcomes',
      lines: outcomeLines,
    })
  }

  return sections
}

/** Flattened preview text block. */
export function formatResolutionSummary(resolution: SpellResolution): string {
  return formatResolutionSummarySections(resolution)
    .flatMap((section) => [section.heading, ...section.lines])
    .join('\n')
}
