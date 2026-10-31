import { formatResolutionEffectSummarySections } from '../../lib/resolution/format-summary'
import { formatResolutionProjectilesPreview } from './format-application-pattern'
import { formatResolutionMethod } from './format-method'
import { formatResolutionSelectionSections } from '../../lib/resolution/format-target'
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

  sections.push(...formatResolutionEffectSummarySections(resolution))

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
