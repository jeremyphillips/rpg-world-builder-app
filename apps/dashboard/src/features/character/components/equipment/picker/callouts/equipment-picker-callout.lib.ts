import {
  equipmentAdvisoryClass,
  resolveEquipmentNotProficientMessage,
  OPTION_PRESENTATION_AVAILABLE_IN_STARTING_OPTION_LABEL,
  OPTION_PRESENTATION_PROFICIENCY_AVAILABLE_LABEL,
  OPTION_PRESENTATION_PROFICIENT_LABEL,
  OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL,
  type OptionPresentationFact,
} from '@rpg/contracts'

import {
  resolveEquipmentOptionRowPresentation,
  type EquipmentOptionSecondaryClause,
} from '../../../../lib/equipment/equipment-option-row-presentation.lib'
import { formatInlineRecommendationSources } from '../../../../lib/recommendation/format-inline-recommendation-sources'
import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  type EquipmentPickerCallout,
  type EquipmentPickerItem,
  type EquipmentPickerCalloutContext,
  type EquipmentPickerCalloutFactKind,
  type EquipmentPickerCalloutSemanticStatus,
} from '../drawer/equipment-picker-drawer.types'

const EQUIPMENT_CALLOUT_SOURCE_PRIORITY = {
  disabledReason: 500,
  affordability: 400,
  requirement: 300,
  compatibility: 200,
  recommendation: 100,
  openPool: 120,
  state: 80,
  proficiencyCaution: 50,
} as const

export type EquipmentCalloutCandidate = {
  priority: (typeof EQUIPMENT_CALLOUT_SOURCE_PRIORITY)[keyof typeof EQUIPMENT_CALLOUT_SOURCE_PRIORITY]
  callout: EquipmentPickerCallout
}

export function selectHighestPriorityCallout(
  candidates: readonly EquipmentCalloutCandidate[],
): EquipmentPickerCallout | undefined {
  return candidates.reduce<EquipmentCalloutCandidate | undefined>(
    (selected, candidate) =>
      !selected || candidate.priority > selected.priority ? candidate : selected,
    undefined,
  )?.callout
}

function tracksProficiency(item: EquipmentPickerItem): boolean {
  return (
    item.equipment.kind === 'weapon' ||
    item.equipment.kind === 'armor' ||
    item.equipment.kind === 'tool'
  )
}

function getAffordabilityCandidate(
  item: EquipmentPickerItem,
): EquipmentCalloutCandidate | undefined {
  if (item.state.purchaseAvailability.status !== 'unaffordable') return undefined

  return {
    priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.affordability,
    callout: {
      label: EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
      intent: 'blocking',
      importance: 'high',
      factKind: 'blocking',
    },
  }
}

function factPriority(fact: OptionPresentationFact): EquipmentCalloutCandidate['priority'] {
  switch (fact.kind) {
    case 'requirement':
      return EQUIPMENT_CALLOUT_SOURCE_PRIORITY.requirement
    case 'compatibility':
      return EQUIPMENT_CALLOUT_SOURCE_PRIORITY.compatibility
    case 'recommendation':
      return EQUIPMENT_CALLOUT_SOURCE_PRIORITY.recommendation
    case 'state':
      return fact.label === OPTION_PRESENTATION_PROFICIENCY_AVAILABLE_LABEL
        ? EQUIPMENT_CALLOUT_SOURCE_PRIORITY.openPool
        : EQUIPMENT_CALLOUT_SOURCE_PRIORITY.state
    default: {
      const _exhaustive: never = fact.kind
      return _exhaustive
    }
  }
}

function factIntent(fact: OptionPresentationFact): EquipmentPickerCallout['intent'] {
  if (fact.kind === 'requirement') return 'recommended'
  if (fact.label === OPTION_PRESENTATION_PROFICIENT_LABEL) return 'compatible'
  if (fact.kind === 'recommendation') return 'recommended'
  return 'info'
}

function factImportance(fact: OptionPresentationFact): EquipmentPickerCallout['importance'] {
  if (fact.kind === 'requirement') return 'high'
  if (fact.label === OPTION_PRESENTATION_PROFICIENT_LABEL) return 'medium'
  if (fact.label === OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL) return 'medium'
  if (fact.kind === 'state') return 'low'
  return 'medium'
}

function calloutFromFact(fact: OptionPresentationFact): EquipmentPickerCallout {
  const sources = formatInlineRecommendationSources(fact.sourceLabels)
  const title =
    fact.kind === 'recommendation' ? sources.title || sources.inline || undefined : fact.detail
  return {
    label: fact.label,
    intent: factIntent(fact),
    importance: factImportance(fact),
    factKind: fact.kind,
    ...(fact.kind === 'recommendation' && sources.inline ? { sourceInline: sources.inline } : {}),
    ...(title ? { title } : {}),
  }
}

function visibleStateFact(fact: OptionPresentationFact, isGoldShoppingPath: boolean): boolean {
  if (fact.label !== OPTION_PRESENTATION_AVAILABLE_IN_STARTING_OPTION_LABEL) return true
  return isGoldShoppingPath
}

function calloutFromClause(
  clause: EquipmentOptionSecondaryClause,
): EquipmentCalloutCandidate | undefined {
  if (clause.kind === 'supply') return undefined
  if (clause.discriminator === 'not-proficient') {
    return {
      priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.proficiencyCaution,
      callout: {
        label: clause.badgeLabel,
        intent: 'info',
        importance: 'medium',
        factKind: 'guidance',
      },
    }
  }
  const fact: OptionPresentationFact = {
    kind:
      clause.kind === 'requirement'
        ? 'requirement'
        : clause.kind === 'recommendation'
          ? 'recommendation'
          : 'compatibility',
    label: clause.badgeLabel,
    sourceLabels: clause.sourceLabels,
    ...(clause.title ? { detail: clause.title } : {}),
    ...(clause.discriminator ? { discriminator: clause.discriminator } : {}),
  }
  return {
    priority: factPriority(fact),
    callout: calloutFromFact(fact),
  }
}

function semanticClauseCandidates(item: EquipmentPickerItem): EquipmentCalloutCandidate[] {
  const resolved = item.state.resolved
  if (!resolved) return []
  const presentation = resolveEquipmentOptionRowPresentation({
    identity: item.equipment.name,
    kindLabel: '',
    resolved,
    equipment: item.equipment,
  })
  return presentation.secondaryClauses.flatMap((clause) => {
    const candidate = calloutFromClause(clause)
    return candidate ? [candidate] : []
  })
}

function presentationCandidates(
  item: EquipmentPickerItem,
  context: EquipmentPickerCalloutContext,
): EquipmentCalloutCandidate[] {
  const facts = item.state.resolved?.presentation?.facts ?? []
  const isGoldShoppingPath = context.isGoldShoppingPath ?? false
  const stateCandidates = facts.flatMap((fact) => {
    if (fact.kind !== 'state' || fact.discriminator === 'included') return []
    if (!visibleStateFact(fact, isGoldShoppingPath)) return []
    return [
      {
        priority: factPriority(fact),
        callout: calloutFromFact(fact),
      },
    ]
  })
  return [...semanticClauseCandidates(item), ...stateCandidates]
}

function getProficiencyCautionCandidate(
  item: EquipmentPickerItem,
): EquipmentCalloutCandidate | undefined {
  const proficient = item.state.resolved?.state.compatibility?.proficient
  const notProficient =
    proficient === undefined
      ? !item.state.isProficient && tracksProficiency(item)
      : proficient === false
  if (!notProficient) return undefined
  const equipmentClass = equipmentAdvisoryClass(item.equipment)
  if (!equipmentClass) return undefined

  return {
    priority: EQUIPMENT_CALLOUT_SOURCE_PRIORITY.proficiencyCaution,
    callout: {
      label: resolveEquipmentNotProficientMessage(equipmentClass),
      intent: 'info',
      importance: 'medium',
      factKind: 'guidance',
    },
  }
}

function semanticStatus(
  candidate: EquipmentCalloutCandidate,
): EquipmentPickerCalloutSemanticStatus | undefined {
  const factKind: EquipmentPickerCalloutFactKind | undefined = candidate.callout.factKind
  switch (factKind) {
    case 'blocking':
      return 'blocking'
    case 'requirement':
      return 'essential'
    case 'compatibility':
      return 'compatibility'
    case 'caution':
    case 'guidance':
      return 'not_proficient'
    case 'state':
      return candidate.callout.label === OPTION_PRESENTATION_AVAILABLE_IN_STARTING_OPTION_LABEL
        ? 'standard'
        : 'info'
    case 'recommendation':
      return 'info'
    default:
      return 'info'
  }
}

function filterCandidatesByVisibleStatuses(
  candidates: readonly EquipmentCalloutCandidate[],
  context: EquipmentPickerCalloutContext,
): EquipmentCalloutCandidate[] {
  const visibleStatuses = context.visibleStatuses
  if (!visibleStatuses || visibleStatuses.length === 0) return [...candidates]

  const allowed = new Set(visibleStatuses)
  return candidates.filter((candidate) => {
    const status = semanticStatus(candidate)
    return status !== undefined && allowed.has(status)
  })
}

function collectEquipmentCalloutCandidates(
  item: EquipmentPickerItem,
  context: EquipmentPickerCalloutContext,
): EquipmentCalloutCandidate[] {
  const semantic = presentationCandidates(item, context)
  const semanticHasCaution = semantic.some(
    (candidate) =>
      candidate.callout.factKind === 'caution' || candidate.callout.factKind === 'guidance',
  )
  return [
    getAffordabilityCandidate(item),
    ...semantic,
    semanticHasCaution ? undefined : getProficiencyCautionCandidate(item),
  ].filter((candidate): candidate is EquipmentCalloutCandidate => candidate !== undefined)
}

/**
 * Single badge from presentation facts. Affordability and proficiency caution stay
 * picker-state overlays. Source truncation is attached for the row to render.
 */
export function getEquipmentPickerCallout(
  item: EquipmentPickerItem,
  context: EquipmentPickerCalloutContext = {},
): EquipmentPickerCallout | undefined {
  const candidates = filterCandidatesByVisibleStatuses(
    collectEquipmentCalloutCandidates(item, context),
    context,
  )
  return selectHighestPriorityCallout(candidates)
}

function appendSourceInline(labels: string[], callout: EquipmentPickerCallout | undefined): void {
  if (!callout?.sourceInline || callout.sourceInline === callout.label) return
  labels.push(callout.sourceInline)
}

function appendSecondaryStateLabels(args: {
  labels: string[]
  facts: readonly OptionPresentationFact[]
  callout: EquipmentPickerCallout | undefined
  isGoldShoppingPath: boolean
}): void {
  for (const fact of args.facts) {
    if (fact.kind !== 'state') continue
    if (!visibleStateFact(fact, args.isGoldShoppingPath)) continue
    if (fact.label === args.callout?.label) continue
    args.labels.push(fact.label)
  }
}

function appendCompatibilityDetail(
  labels: string[],
  facts: readonly OptionPresentationFact[],
  callout: EquipmentPickerCallout | undefined,
): void {
  if (callout?.factKind !== 'compatibility' || !callout.title || labels.includes(callout.title)) {
    return
  }
  const detail = facts.find((fact) => fact.label === callout.label)?.detail
  if (detail) labels.push(detail)
}

/** State lines that are not the winning badge, plus truncated source chrome. */
export function getEquipmentPickerSecondaryLabels(
  item: EquipmentPickerItem,
  context: EquipmentPickerCalloutContext = {},
): string[] {
  const callout = getEquipmentPickerCallout(item, context)
  const labels: string[] = []
  const facts = item.state.resolved?.presentation?.facts ?? []
  appendSourceInline(labels, callout)
  appendSecondaryStateLabels({
    labels,
    facts,
    callout,
    isGoldShoppingPath: context.isGoldShoppingPath ?? false,
  })
  appendCompatibilityDetail(labels, facts, callout)
  return labels
}
