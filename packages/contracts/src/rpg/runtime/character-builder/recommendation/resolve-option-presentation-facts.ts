import type { OptionRecommendation } from './recommendation-envelope'
import { compareSourcePriority } from './recommendation-comparators'
import { formatRecommendationSourceLabel } from './format-recommendation-source-label'
import type { RecommendationSourceRef } from './recommendation-source-ref'

export const OPTION_PRESENTATION_FACT_KINDS = [
  'requirement',
  'recommendation',
  'compatibility',
  'state',
] as const

export type OptionPresentationFactKind = (typeof OPTION_PRESENTATION_FACT_KINDS)[number]

/** Semantic copy. Chrome (tone, truncation, tooltip placement) stays in the dashboard. */
export type OptionPresentationFact = {
  kind: OptionPresentationFactKind
  label: string
  detail?: string
  sourceLabels: readonly string[]
}

export type OptionPresentationFacts = {
  facts: readonly OptionPresentationFact[]
}

export const OPTION_PRESENTATION_RECOMMENDED_LABEL = 'Recommended'
export const OPTION_PRESENTATION_PROFICIENT_LABEL = 'Proficient'
export const OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL = 'Spellcasting focus'
export const OPTION_PRESENTATION_COMMON_FOR_CLASS_LABEL = 'Common for your class'
export const OPTION_PRESENTATION_IN_PACKAGE_LABEL = 'In your package'
export const OPTION_PRESENTATION_AVAILABLE_IN_STARTING_OPTION_LABEL = 'Available in starting option'
export const OPTION_PRESENTATION_PROFICIENCY_AVAILABLE_LABEL = 'Proficiency available'
export const OPTION_PRESENTATION_STARTING_OPTION_LABEL = 'Starting option'

export type RecommendationSourceName = (source: RecommendationSourceRef) => string | undefined

export function requiredByLabel(ownerLabel: string): string {
  return `Required by ${ownerLabel}`
}

export function satisfiesFocusRequirementLabel(ownerName: string): string {
  return `Satisfies ${ownerName} focus requirement`
}

export function grantedByLabel(ownerLabel: string): string {
  return `Granted by ${ownerLabel}`
}

export function includedQuantityLabel(quantity: number): string {
  return `×${quantity} included`
}

export function recommendationSourceLabels(
  recommendation: OptionRecommendation,
  sourceName?: RecommendationSourceName,
): string[] {
  const labeled = recommendation.signals.flatMap((signal) => {
    if (!signal.source) return []
    const label = formatRecommendationSourceLabel(signal.source, {
      name: sourceName?.(signal.source),
    })
    return label ? [{ kind: signal.source.kind, label }] : []
  })
  labeled.sort((left, right) => compareSourcePriority(left.kind, right.kind))
  const labels: string[] = []
  for (const entry of labeled) {
    if (!labels.includes(entry.label)) labels.push(entry.label)
  }
  return labels
}

export function softRecommendationFact(args: {
  recommendation: OptionRecommendation
  sourceName?: RecommendationSourceName
  /** Authored badge override. Ignored when a requirement owns the row. */
  authoredLabel?: string
}): OptionPresentationFact | undefined {
  const { recommendation } = args
  if (recommendation.strength !== 'strong' && recommendation.strength !== 'compatible') {
    return undefined
  }
  if (recommendation.signals.length === 0) return undefined
  const sourceLabels = recommendationSourceLabels(recommendation, args.sourceName)
  const toolCategoryOnly = recommendation.signals.every(
    (signal) => signal.detail?.kind === 'toolCategory',
  )
  const label = toolCategoryOnly
    ? OPTION_PRESENTATION_COMMON_FOR_CLASS_LABEL
    : (args.authoredLabel ?? OPTION_PRESENTATION_RECOMMENDED_LABEL)
  return {
    kind: 'recommendation',
    label,
    sourceLabels,
  }
}
