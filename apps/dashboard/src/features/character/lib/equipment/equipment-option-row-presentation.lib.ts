import {
  formatEquipmentSupplySourceLabels,
  OPTION_PRESENTATION_RECOMMENDED_LABEL,
  resolveEquipmentPresentationFacts,
  type EquipmentSupplySource,
  type OptionPresentationFact,
  type RecommendationSourceName,
  type ResolvedEquipmentOption,
  type SelectionSourceLabelCatalogIndex,
} from '@rpg/contracts'

import { formatInlineRecommendationSources } from '../recommendation/format-inline-recommendation-sources'

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

const INLINE_CLAUSE_DISCRIMINATORS = new Set([
  'required',
  'satisfies',
  'not-proficient',
  'recommended',
])

function clauseRank(clause: EquipmentOptionSecondaryClause): number {
  if (clause.discriminator === 'required' || clause.discriminator === 'satisfies') return 0
  if (clause.discriminator === 'not-proficient') return 1
  if (clause.discriminator === 'recommended') return 2
  if (clause.kind === 'supply') return 3
  if (clause.discriminator === 'proficient') return 4
  return 5
}

function requirementClause(fact: OptionPresentationFact): EquipmentOptionSecondaryClause {
  return {
    kind: 'requirement',
    label: fact.label,
    badgeLabel: fact.label,
    sourceLabels: fact.sourceLabels,
    ...(fact.discriminator ? { discriminator: fact.discriminator } : {}),
  }
}

function recommendationClause(fact: OptionPresentationFact): EquipmentOptionSecondaryClause {
  const sources = formatInlineRecommendationSources(fact.sourceLabels)
  const label = sources.inline
    ? `${OPTION_PRESENTATION_RECOMMENDED_LABEL} by ${sources.inline}`
    : fact.label
  return {
    kind: 'recommendation',
    label,
    badgeLabel: fact.label,
    sourceLabels: fact.sourceLabels,
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
  return {
    kind: 'supply',
    label,
    badgeLabel: label,
    sourceLabels: [],
  }
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
  if (fact.discriminator === 'required' || fact.discriminator === 'satisfies') {
    return requirementClause(fact)
  }
  if (fact.discriminator === 'recommended') return recommendationClause(fact)
  if (fact.discriminator === 'proficient' || fact.discriminator === 'not-proficient') {
    return compatibilityClause(fact)
  }
  if (fact.kind === 'compatibility' && fact.label) return compatibilityClause(fact)
  return undefined
}

function buildEquipmentOptionSecondaryClauses(args: {
  facts: readonly OptionPresentationFact[]
  selectionSources: readonly EquipmentSupplySource[]
  supplyCatalog?: SelectionSourceLabelCatalogIndex
}): EquipmentOptionSecondaryClause[] {
  const secondaryClauses = args.facts.flatMap((fact) => {
    const clause = clauseFromFact(fact)
    return clause ? [clause] : []
  })
  const supply = supplyClause(args.selectionSources, args.supplyCatalog)
  if (supply) secondaryClauses.push(supply)
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
  return parts.length > 0 ? parts.join(' · ') : undefined
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
  sourceName?: RecommendationSourceName
  supplyCatalog?: SelectionSourceLabelCatalogIndex
}): EquipmentOptionRowPresentation {
  const facts = resolveEquipmentPresentationFacts({
    resolved: args.resolved,
    ...(args.sourceName ? { sourceName: args.sourceName } : {}),
  })
  const secondaryClauses = buildEquipmentOptionSecondaryClauses({
    facts: facts.facts,
    selectionSources: args.resolved.state.selection?.sources ?? [],
    supplyCatalog: args.supplyCatalog,
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
