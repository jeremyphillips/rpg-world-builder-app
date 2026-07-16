import {
  formatResolutionDamage,
  formatResolutionHealing,
  formatResolutionTemporaryHitPoints,
} from './format-effect-lines'
import { formatResolutionMethod } from './format-method'
import { formatResolutionProjectilesPreview } from './format-application-pattern'
import { formatResolutionOutcomes } from './format-outcomes'
import { formatResolutionSelectionSections } from './format-target'
import { formatResolutionProgressionSummary } from './progression/format'
import type { SpellResolution } from './schema'

export type FormatResolutionSummaryOptions = {
  spellLevel?: number
  characterLevel?: number
  castSlotLevel?: number
}

export type SpellResolutionSummarySection = {
  heading: string
  lines: string[]
}

/** Structured summary sections for preview panels. */
export function formatResolutionSummarySections(
  resolution: SpellResolution,
  options: FormatResolutionSummaryOptions = {},
): SpellResolutionSummarySection[] {
  const sections: SpellResolutionSummarySection[] = [
    ...formatResolutionSelectionSections(resolution),
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

  if (resolution.progression && options.spellLevel !== undefined) {
    sections.push({
      heading: 'Progression',
      lines: formatResolutionProgressionSummary(resolution, resolution.progression, {
        spellLevel: options.spellLevel,
        characterLevel: options.characterLevel,
        castSlotLevel: options.castSlotLevel,
      }),
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
