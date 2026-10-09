import {
  formatEquipmentSupplySourceLabels,
  OPTION_PRESENTATION_RECOMMENDED_LABEL,
  resolveEquipmentPresentationFacts,
  type EquipmentSupplySource,
  type OptionPresentationFact,
  type Equipment,
  type RecommendationSourceName,
  type ResolvedEquipmentOption,
  type SelectionSourceLabelCatalogIndex,
} from '@rpg/contracts'

import { formatInlineRecommendationSources } from '../recommendation/format-inline-recommendation-sources'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

export const EQUIPMENT_OPTION_ROW_INLINE_CLAUSE_LIMIT = 2

export function equipmentOptionQuantityAccessibleLabel(quantity: number): string {
  return `Quantity ${quantity}`
}

export const EQUIPMENT_OPTION_SECONDARY_CLAUSE_KINDS = [
  'requirement',
  'recommendation',
  'supply',
  'compatibility',
] as const

export type EquipmentOptionSecondaryClauseKind =
  (typeof EQUIPMENT_OPTION_SECONDARY_CLAUSE_KINDS)[number]

export type EquipmentOptionSecondaryClause = {
  kind: EquipmentOptionSecondaryClauseKind
  /** Compact sentence for inline rows and tooltips. */
  label: string
  /** Builder badge label when it stays shorter than {@link label}. */
  badgeLabel: string
  title?: string
  sourceLabels: readonly string[]
  discriminator?: OptionPresentationFact['discriminator']
}

/** Atomic supply fact. Quick NPC produces these; this module does not import NPC types. */
export type EquipmentOptionSupplyClause = {
  label: string
  source: EquipmentSupplySource
}

export type EquipmentOptionTrailingState = {
  label: string
  accessibleLabel: string
}

export type EquipmentOptionRowPresentation = {
  identity: string
  kindLabel: string
  metadata: readonly string[]
  trailingState?: EquipmentOptionTrailingState
  secondaryClauses: readonly EquipmentOptionSecondaryClause[]
  secondaryTitle?: string
  disabled: boolean
}

const INLINE_CLAUSE_DISCRIMINATORS = new Set<OptionPresentationFact['discriminator']>([
  'required',
  'requirement-match',
  'not-proficient',
  'ability-requirement-unmet',
  'recommended',
])

function isRequirementDiscriminator(discriminator: OptionPresentationFact['discriminator']) {
  return discriminator === 'required' || discriminator === 'requirement-match'
}

function clauseRank(clause: EquipmentOptionSecondaryClause): number {
  if (isRequirementDiscriminator(clause.discriminator)) return 0
  if (
    clause.discriminator === 'not-proficient' ||
    clause.discriminator === 'ability-requirement-unmet'
  ) {
    return 1
  }
  if (clause.discriminator === 'recommended') return 2
  if (clause.kind === 'supply') return 3
  if (clause.discriminator === 'proficient') return 4
  return 5
}

function requirementClause(fact: OptionPresentationFact): EquipmentOptionSecondaryClause {
  const title = fact.sourceLabels.join(', ')
  return {
    kind: 'requirement',
    label: fact.label,
    badgeLabel: fact.label,
    sourceLabels: fact.sourceLabels,
    ...(fact.discriminator ? { discriminator: fact.discriminator } : {}),
    ...(title ? { title } : {}),
  }
}

/** One clause for every per-kind recommendation fact, keeping the named inline sentence. */
function recommendationClause(
  facts: readonly OptionPresentationFact[],
): EquipmentOptionSecondaryClause | undefined {
  const [first] = facts
  if (!first) return undefined
  const sourceLabels = [...new Set(facts.flatMap((fact) => fact.sourceLabels))]
  const sources = formatInlineRecommendationSources(sourceLabels)
  const badgeLabel = facts.length === 1 ? first.label : OPTION_PRESENTATION_RECOMMENDED_LABEL
  const label = sources.inline
    ? `${OPTION_PRESENTATION_RECOMMENDED_LABEL} by ${sources.inline}`
    : badgeLabel
  return {
    kind: 'recommendation',
    label,
    badgeLabel,
    sourceLabels,
    discriminator: 'recommended',
    ...(sources.title ? { title: sources.title } : {}),
  }
}

function compatibilityClause(fact: OptionPresentationFact): EquipmentOptionSecondaryClause {
  return {
    kind: 'compatibility',
    label: fact.detail ?? fact.label,
    badgeLabel: fact.label,
    sourceLabels: fact.sourceLabels,
    ...(fact.discriminator ? { discriminator: fact.discriminator } : {}),
    ...(fact.detail ? { title: fact.detail } : {}),
  }
}

function supplyClause(
  sources: readonly EquipmentSupplySource[],
  catalogIndex: SelectionSourceLabelCatalogIndex | undefined,
): EquipmentOptionSecondaryClause | undefined {
  if (sources.length === 0) return undefined
  const label = formatEquipmentSupplySourceLabels(sources, catalogIndex)
  if (!label) return undefined
  return supplyClauseFromLabel(label)
}

function supplyClauseFromLabel(label: string): EquipmentOptionSecondaryClause {
  return {
    kind: 'supply',
    label,
    badgeLabel: label,
    sourceLabels: [],
  }
}

function recommendedRoleIds(resolved: ResolvedEquipmentOption): ReadonlySet<string> {
  const ids = new Set<string>()
  for (const signal of resolved.recommendation.signals) {
    const source = signal.source
    if (source?.kind === 'role') ids.add(source.id)
  }
  return ids
}

/** Drops a role supply clause already named by the recommendation. */
function visibleSupplyClauses(
  clauses: readonly EquipmentOptionSupplyClause[],
  resolved: ResolvedEquipmentOption,
): EquipmentOptionSupplyClause[] {
  const roleIds = recommendedRoleIds(resolved)
  return clauses.filter((clause) => {
    if (clause.source.kind !== 'role' && clause.source.kind !== 'role-default') return true
    return !roleIds.has(clause.source.id)
  })
}

function trailingState(
  resolved: ResolvedEquipmentOption,
): EquipmentOptionTrailingState | undefined {
  const selection = resolved.state.selection
  if (!selection || selection.quantity <= 0) return undefined
  return {
    label: `×${selection.quantity}`,
    accessibleLabel: equipmentOptionQuantityAccessibleLabel(selection.quantity),
  }
}

function clauseFromFact(fact: OptionPresentationFact): EquipmentOptionSecondaryClause | undefined {
  if (isRequirementDiscriminator(fact.discriminator)) return requirementClause(fact)
  if (fact.kind === 'compatibility' && fact.label) return compatibilityClause(fact)
  return undefined
}

function buildEquipmentOptionSecondaryClauses(args: {
  facts: readonly OptionPresentationFact[]
  selectionSources: readonly EquipmentSupplySource[]
  supplyClauses?: readonly EquipmentOptionSupplyClause[]
  supplyCatalog?: SelectionSourceLabelCatalogIndex
  resolved: ResolvedEquipmentOption
}): EquipmentOptionSecondaryClause[] {
  const secondaryClauses = args.facts.flatMap((fact) => {
    const clause = clauseFromFact(fact)
    return clause ? [clause] : []
  })
  const recommendation = recommendationClause(
    args.facts.filter((fact) => fact.discriminator === 'recommended'),
  )
  if (recommendation) secondaryClauses.push(recommendation)
  const supply = args.supplyClauses
    ? visibleSupplyClauses(args.supplyClauses, args.resolved).map((clause) =>
        supplyClauseFromLabel(clause.label),
      )
    : supplyClause(args.selectionSources, args.supplyCatalog)
  if (Array.isArray(supply)) secondaryClauses.push(...supply)
  else if (supply) secondaryClauses.push(supply)
  secondaryClauses.sort((left, right) => clauseRank(left) - clauseRank(right))
  return secondaryClauses
}

function secondaryTitleFromClauses(clauses: EquipmentOptionSecondaryClause[]): string | undefined {
  const parts = clauses.map((clause) => {
    if (clause.kind === 'recommendation' && clause.title) {
      return `${OPTION_PRESENTATION_RECOMMENDED_LABEL} by ${clause.title}`
    }
    if (clause.kind === 'recommendation') return clause.label
    if (clause.title && clause.title !== clause.label)
      return `${clause.badgeLabel}. ${clause.title}`
    return clause.label
  })
  return parts.length > 0 ? joinInlineMetadata(parts) : undefined
}

/**
 * Surface-neutral equipment row semantics.
 * Builder and Quick NPC choose their own chrome from these clauses.
 */
export function resolveEquipmentOptionRowPresentation(args: {
  identity: string
  kindLabel: string
  metadata?: readonly string[]
  resolved: ResolvedEquipmentOption
  equipment?: Equipment
  sourceName?: RecommendationSourceName
  supplyCatalog?: SelectionSourceLabelCatalogIndex
  /**
   * Preformatted supply facts. When set, selection sources are not joined into
   * a supply sentence. Callers choose which origins to include.
   */
  supplyClauses?: readonly EquipmentOptionSupplyClause[]
}): EquipmentOptionRowPresentation {
  const facts = resolveEquipmentPresentationFacts({
    resolved: args.resolved,
    ...(args.equipment ? { equipment: args.equipment } : {}),
    ...(args.sourceName ? { sourceName: args.sourceName } : {}),
  })
  const secondaryClauses = buildEquipmentOptionSecondaryClauses({
    facts: facts.facts,
    selectionSources: args.resolved.state.selection?.sources ?? [],
    ...(args.supplyClauses ? { supplyClauses: args.supplyClauses } : {}),
    supplyCatalog: args.supplyCatalog,
    resolved: args.resolved,
  })

  const trailing = trailingState(args.resolved)
  const secondaryTitle = secondaryTitleFromClauses(secondaryClauses)
  const selection = args.resolved.state.selection
  return {
    identity: args.identity,
    kindLabel: args.kindLabel,
    metadata: args.metadata ?? [],
    ...(trailing ? { trailingState: trailing } : {}),
    secondaryClauses,
    ...(secondaryTitle ? { secondaryTitle } : {}),
    disabled: selection ? !selection.canAddMore : false,
  }
}

/** Quick NPC shows at most two inline clauses. Remaining clauses stay on {@link EquipmentOptionRowPresentation.secondaryTitle}. */
export function equipmentOptionInlineClauses(
  presentation: EquipmentOptionRowPresentation,
  limit = EQUIPMENT_OPTION_ROW_INLINE_CLAUSE_LIMIT,
): EquipmentOptionSecondaryClause[] {
  return presentation.secondaryClauses
    .filter(
      (clause) =>
        clause.kind === 'supply' ||
        (clause.discriminator !== undefined &&
          INLINE_CLAUSE_DISCRIMINATORS.has(clause.discriminator)),
    )
    .slice(0, limit)
}

export function equipmentOptionAccessibleLabel(
  presentation: EquipmentOptionRowPresentation,
): string {
  return [
    presentation.identity,
    presentation.kindLabel,
    ...presentation.metadata,
    presentation.trailingState?.accessibleLabel,
    presentation.secondaryTitle,
  ]
    .filter((part) => part && part.length > 0)
    .join(', ')
}
