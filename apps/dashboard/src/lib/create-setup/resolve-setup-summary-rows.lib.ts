import { CREATE_SETUP_DEFAULT_GROUPED_SUMMARY_EYEBROW } from './create-setup.constants'
import { resolveCreateSetupChoiceValueLabel } from './create-setup-completed-choice-groups.lib'
import type { CreateSetupSet } from './create-setup.types'

export type SetupSummaryRow = {
  id: string
  label: string
  value: string
  targetSetId: string
  secondary?: string
}

export type CreateSetupSummaryDefinition<TState> = {
  id: string
  label: string
  targetSetId: string
  /** Card grouping only. Does not filter which resolved rows render. */
  summaryGroup?: string
  summaryGroupEyebrow?: string
  resolveValue: (state: TState) => string | null | undefined
  resolveSecondary?: (state: TState) => string | null | undefined
}

export type SetupSummaryCard = {
  id: string
  eyebrow: string
  rows: SetupSummaryRow[]
}

type ResolvedSetupSummaryDefinition<TState> = CreateSetupSummaryDefinition<TState> & {
  value: string
  secondary?: string
}

function normalizeSetupSummaryText(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function resolveSetupSummaryDefinition<TState>(
  state: TState,
  definition: CreateSetupSummaryDefinition<TState>,
): ResolvedSetupSummaryDefinition<TState> | null {
  const value = normalizeSetupSummaryText(definition.resolveValue(state))
  if (!value) return null

  const secondary = normalizeSetupSummaryText(definition.resolveSecondary?.(state))
  return {
    ...definition,
    value,
    ...(secondary ? { secondary } : {}),
  }
}

function toSetupSummaryRow<TState>(
  definition: ResolvedSetupSummaryDefinition<TState>,
): SetupSummaryRow {
  return {
    id: definition.id,
    label: definition.label,
    value: definition.value,
    targetSetId: definition.targetSetId,
    ...(definition.secondary ? { secondary: definition.secondary } : {}),
  }
}

/**
 * Rows for every definition that currently has a resolved display value.
 * Order follows the registry. Validity of dependent values is not decided here.
 */
export function resolveSetupSummaryRows<TState>(
  state: TState,
  registry: readonly CreateSetupSummaryDefinition<TState>[],
): SetupSummaryRow[] {
  return registry.flatMap((definition) => {
    const resolved = resolveSetupSummaryDefinition(state, definition)
    return resolved ? [toSetupSummaryRow(resolved)] : []
  })
}

/** Groups resolved rows into summary cards without dropping active or downstream values. */
export function resolveSetupSummaryCards<TState>(
  state: TState,
  registry: readonly CreateSetupSummaryDefinition<TState>[],
): SetupSummaryCard[] {
  const resolved = registry.flatMap((definition) => {
    const row = resolveSetupSummaryDefinition(state, definition)
    return row ? [row] : []
  })
  const emittedGroups = new Set<string>()
  const cards: SetupSummaryCard[] = []

  for (const definition of resolved) {
    const summaryGroup = definition.summaryGroup
    if (summaryGroup) {
      if (emittedGroups.has(summaryGroup)) continue
      emittedGroups.add(summaryGroup)

      const members = resolved.filter((member) => member.summaryGroup === summaryGroup)
      const eyebrow =
        members.find((member) => member.summaryGroupEyebrow)?.summaryGroupEyebrow ??
        CREATE_SETUP_DEFAULT_GROUPED_SUMMARY_EYEBROW

      cards.push({
        id: `group:${summaryGroup}`,
        eyebrow,
        rows: members.map(toSetupSummaryRow),
      })
      continue
    }

    cards.push({
      id: `standalone:${definition.id}`,
      eyebrow: definition.summaryGroupEyebrow ?? definition.label,
      rows: [toSetupSummaryRow(definition)],
    })
  }

  return cards
}

function resolveChoiceSetSummaryValue(set: CreateSetupSet): string | null {
  if (set.kind !== 'choice') return null
  if (!set.value && !set.skipped) return null
  return normalizeSetupSummaryText(resolveCreateSetupChoiceValueLabel(set))
}

/** Default registry for choice-set flows whose summary value is the selected option. */
export function createChoiceSetSummaryDefinitions(
  sets: readonly CreateSetupSet[],
): CreateSetupSummaryDefinition<readonly CreateSetupSet[]>[] {
  return sets.map((set) => ({
    id: set.id,
    label: set.summaryLabel ?? set.fieldLabel,
    targetSetId: set.id,
    ...(set.summaryGroup ? { summaryGroup: set.summaryGroup } : {}),
    ...(set.summaryGroupEyebrow ? { summaryGroupEyebrow: set.summaryGroupEyebrow } : {}),
    resolveValue: (currentSets) => {
      const current = currentSets.find((candidate) => candidate.id === set.id)
      return current ? resolveChoiceSetSummaryValue(current) : null
    },
  }))
}
