import {
  formatResolutionDamage,
  formatResolutionHealing,
  formatResolutionTemporaryHitPoints,
} from './format-effect-lines'
import { formatEffectResolutionMethod } from './format-method'
import { formatResolutionOutcomes } from './format-outcomes'
import { formatResolutionSelectionSections } from './format-target'
import type { EffectResolution, ResolutionFormatInput } from './schema'

export type ResolutionSummarySection = {
  heading: string
  lines: string[]
}

/** Damage, healing, temporary hit points, and outcome sections. */
export function formatResolutionEffectSummarySections(
  resolution: ResolutionFormatInput,
): ResolutionSummarySection[] {
  const sections: ResolutionSummarySection[] = []

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

/** Selection, check, effects, and outcomes for a content-neutral envelope. */
export function formatEffectResolutionSummarySections(
  resolution: EffectResolution,
): ResolutionSummarySection[] {
  return [
    ...formatResolutionSelectionSections(resolution),
    {
      heading: 'Check',
      lines: [formatEffectResolutionMethod(resolution, 'resolution-preview')],
    },
    ...formatResolutionEffectSummarySections(resolution),
  ]
}

/** Flattened preview text block for a content-neutral envelope. */
export function formatEffectResolutionSummary(resolution: EffectResolution): string {
  return formatEffectResolutionSummarySections(resolution)
    .flatMap((section) => [section.heading, ...section.lines])
    .join('\n')
}
