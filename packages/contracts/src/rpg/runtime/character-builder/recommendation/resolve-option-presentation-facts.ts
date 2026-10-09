import { isStartingEquipmentRecommendationReason } from '../../../content/equipment-recommendation'
import type { Ability } from '../../../vocab/ability'
import {
  ABILITY_FIT_RECOMMENDATION_REASON,
  type OptionRecommendation,
  type RecommendationSignal,
} from './recommendation-envelope'
import { compareSourcePriority } from './recommendation-comparators'
import {
  formatRecommendationSourceKindWord,
  formatRecommendationSourceLabel,
} from './format-recommendation-source-label'
import type { RecommendationSourceKind, RecommendationSourceRef } from './recommendation-source-ref'

export const OPTION_PRESENTATION_FACT_KINDS = [
  'requirement',
  'recommendation',
  'compatibility',
  'state',
] as const

export type OptionPresentationFactKind = (typeof OPTION_PRESENTATION_FACT_KINDS)[number]

/**
 * Stable semantic tag. Dashboard adapters branch on this value, never on labels.
 * The requirement, recommendation, selection, and compatibility models stay authoritative.
 */
export const OPTION_PRESENTATION_DISCRIMINATORS = [
  'required',
  'requirement-match',
  'recommended',
  'proficient',
  'not-proficient',
  'ability-requirement-unmet',
  'in-package',
  'open-pool',
  'alternative-package',
  'spellcasting-focus',
] as const

export type OptionPresentationDiscriminator = (typeof OPTION_PRESENTATION_DISCRIMINATORS)[number]

/** `candidate` is an open requirement; `satisfier` is the option that currently fulfills it. */
export type OptionPresentationRequirementRole = 'candidate' | 'satisfier'

/** Semantic copy. Chrome (tone, truncation, tooltip placement) stays in the dashboard. */
export type OptionPresentationFact = {
  kind: OptionPresentationFactKind
  label: string
  detail?: string
  sourceLabels: readonly string[]
  discriminator?: OptionPresentationDiscriminator
  /** Owner or signal source kind — requirement and recommendation facts. */
  sourceKind?: RecommendationSourceKind
  /** Requirement facts only. Satisfied state is data; surfaces decide visibility. */
  requirementRole?: OptionPresentationRequirementRole
  /** Recommendation facts only. Ownership is data; surfaces decide visibility. */
  owned?: boolean
  /** `ability-requirement-unmet` facts only — the ability whose minimum is unmet. */
  ability?: Ability
}

export type OptionPresentationFacts = {
  facts: readonly OptionPresentationFact[]
}

export const OPTION_PRESENTATION_RECOMMENDED_LABEL = 'Recommended'
export const OPTION_PRESENTATION_PROFICIENT_LABEL = 'Proficient'
export const OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL = 'Spellcasting focus'
export const OPTION_PRESENTATION_COMMON_FOR_CLASS_LABEL = 'Common for your class'
export const OPTION_PRESENTATION_IN_PACKAGE_LABEL = 'In your package'
export const OPTION_PRESENTATION_INCLUDED_IN_PACKAGE_OPTION_LABEL = 'Included in package option'
export const OPTION_PRESENTATION_PROFICIENCY_AVAILABLE_LABEL = 'Proficiency available'
export const OPTION_PRESENTATION_STARTING_OPTION_LABEL = 'Starting option'
export const OPTION_PRESENTATION_MATCHES_FOCUS_REQUIREMENT_LABEL = 'Matches focus requirement'
export const OPTION_PRESENTATION_SATISFIES_FOCUS_REQUIREMENT_LABEL = 'Satisfies focus requirement'

export type RecommendationSourceName = (source: RecommendationSourceRef) => string | undefined

/** "Required by class" — the named owner belongs in `sourceLabels`. */
export function requiredByLabel(kind: RecommendationSourceKind): string {
  return `Required by ${formatRecommendationSourceKindWord(kind)}`
}

/** "Recommended by species" — the named source belongs in `sourceLabels`. */
export function recommendedByLabel(kind: RecommendationSourceKind): string {
  return `Recommended by ${formatRecommendationSourceKindWord(kind)}`
}

export function grantedByLabel(ownerLabel: string): string {
  return `Granted by ${ownerLabel}`
}

function signalSourceLabels(
  signals: readonly RecommendationSignal[],
  sourceName: RecommendationSourceName | undefined,
): string[] {
  const labeled = signals.flatMap((signal) => {
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

export function recommendationSourceLabels(
  recommendation: OptionRecommendation,
  sourceName?: RecommendationSourceName,
): string[] {
  return signalSourceLabels(recommendation.signals, sourceName)
}

type SignalGroup = {
  sourceKind: RecommendationSourceKind | undefined
  signals: RecommendationSignal[]
}

function groupSignalsBySourceKind(signals: readonly RecommendationSignal[]): SignalGroup[] {
  const groups: SignalGroup[] = []
  for (const signal of signals) {
    if (signal.strength === 'discouraged') continue
    const sourceKind = signal.source?.kind
    const group = groups.find((entry) => entry.sourceKind === sourceKind)
    if (group) group.signals.push(signal)
    else groups.push({ sourceKind, signals: [signal] })
  }
  return groups.sort((left, right) => compareSourcePriority(left.sourceKind, right.sourceKind))
}

function softRecommendationLabel(args: {
  group: SignalGroup
  authoredLabel: string | undefined
}): string {
  const { group, authoredLabel } = args
  if (group.signals.every((signal) => signal.detail?.kind === 'toolCategory')) {
    return OPTION_PRESENTATION_COMMON_FOR_CLASS_LABEL
  }
  if (group.sourceKind === 'class' && authoredLabel) return authoredLabel
  return group.sourceKind
    ? recommendedByLabel(group.sourceKind)
    : OPTION_PRESENTATION_RECOMMENDED_LABEL
}

function isOmittedFromRecommendationFacts(reason: RecommendationSignal['reason']): boolean {
  if (reason === ABILITY_FIT_RECOMMENDATION_REASON) return true
  return isStartingEquipmentRecommendationReason(reason)
}

/**
 * One fact per distinct signal source kind (ordered by source priority) so no source is
 * dropped. Source-less signals collapse into a single `Recommended` fact.
 * Ability-fit signals are ranking evidence only and are omitted before that fallback.
 */
export function softRecommendationFacts(args: {
  recommendation: OptionRecommendation
  sourceName?: RecommendationSourceName
  /** Authored class badge override. Ignored when a requirement owns the row. */
  authoredLabel?: string
  /** Stamped on every fact. Visibility is a surface decision, never suppression here. */
  owned?: boolean
}): OptionPresentationFact[] {
  const { recommendation } = args
  if (recommendation.strength !== 'strong' && recommendation.strength !== 'compatible') {
    return []
  }
  const signals = recommendation.signals.filter(
    (signal) => !isOmittedFromRecommendationFacts(signal.reason),
  )
  return groupSignalsBySourceKind(signals).map((group) => ({
    kind: 'recommendation',
    discriminator: 'recommended',
    label: softRecommendationLabel({ group, authoredLabel: args.authoredLabel }),
    sourceLabels: signalSourceLabels(group.signals, args.sourceName),
    ...(group.sourceKind ? { sourceKind: group.sourceKind } : {}),
    ...(args.owned !== undefined ? { owned: args.owned } : {}),
  }))
}
