import type { ReactNode } from 'react'

import { ABILITY_IDS, compareSourcePriority } from '@rpg/contracts'

import type { EntitySummaryStatusItem } from '@/features/content'

import {
  applySelectionRowPolicy,
  SELECTION_ROW_CONTEXT_POLICIES,
  type SelectionRowContext,
} from './selection-row-context-policy'
import {
  SELECTION_GUIDANCE_KINDS,
  SELECTION_SOURCE_REASONS,
  SELECTION_STATUS_KINDS,
  SELECTION_STATUS_REASONS,
  type SelectionGuidanceEntry,
  type SelectionRowPresentation,
  type SelectionStatusEntry,
} from './selection-row-status.types'

/** Rich tooltip for a status badge (for example the affordability amounts). */
export type SelectionRowStatusTooltip = (entry: SelectionStatusEntry) => ReactNode | undefined

export type ResolveSelectionRowStatusItemsOptions = {
  context: SelectionRowContext
  statusTooltip?: SelectionRowStatusTooltip
}

function rankOf<T>(table: readonly T[], value: T | undefined): number {
  const index = value === undefined ? -1 : table.indexOf(value)
  return index === -1 ? table.length : index
}

function subjectRank(entry: SelectionStatusEntry): number {
  if (entry.reason !== 'ability_score_requirement') return 0
  return rankOf<string>(ABILITY_IDS, entry.subject)
}

function compareStatusEntries(a: SelectionStatusEntry, b: SelectionStatusEntry): number {
  return (
    rankOf(SELECTION_STATUS_KINDS, a.kind) - rankOf(SELECTION_STATUS_KINDS, b.kind) ||
    rankOf(SELECTION_STATUS_REASONS, a.reason) - rankOf(SELECTION_STATUS_REASONS, b.reason) ||
    subjectRank(a) - subjectRank(b) ||
    a.key.localeCompare(b.key)
  )
}

function compareGuidanceEntries(a: SelectionGuidanceEntry, b: SelectionGuidanceEntry): number {
  return (
    rankOf(SELECTION_GUIDANCE_KINDS, a.kind) - rankOf(SELECTION_GUIDANCE_KINDS, b.kind) ||
    (a.kind === 'source'
      ? rankOf(SELECTION_SOURCE_REASONS, a.reason) - rankOf(SELECTION_SOURCE_REASONS, b.reason)
      : compareSourcePriority(a.sourceKind, b.sourceKind)) ||
    a.key.localeCompare(b.key)
  )
}

function uniqueByKey<T extends { key: string }>(entries: readonly T[]): T[] {
  const seen = new Set<string>()
  return entries.filter((entry) => {
    if (seen.has(entry.key)) return false
    seen.add(entry.key)
    return true
  })
}

function statusItem(
  entry: SelectionStatusEntry,
  statusTooltip: SelectionRowStatusTooltip | undefined,
): EntitySummaryStatusItem {
  if (entry.kind === 'notice') {
    return {
      kind: 'text',
      variant: 'muted',
      label: entry.label,
      ...(entry.detail ? { title: entry.detail } : {}),
    }
  }
  const tooltip = statusTooltip?.(entry)
  return {
    kind: 'badge',
    label: entry.label,
    tone: entry.kind === 'blocker' ? 'destructive' : 'warning',
    appearance: 'soft',
    ...(tooltip ? { tooltip } : entry.detail ? { title: entry.detail } : {}),
  }
}

function guidanceItem(entry: SelectionGuidanceEntry): EntitySummaryStatusItem {
  const title = entry.sourceLabels?.join(', ')
  return {
    kind: 'text',
    variant: 'guidance',
    label: entry.label,
    ...(title ? { title } : {}),
  }
}

/**
 * The only way to render a selection row: applies the context policy, then the fixed
 * rank tables, dedupes by semantic key, and maps tone. Status precedes guidance.
 */
export function resolveSelectionRowStatusItems(
  presentation: SelectionRowPresentation,
  options: ResolveSelectionRowStatusItemsOptions,
): EntitySummaryStatusItem[] {
  const visible = applySelectionRowPolicy(
    presentation,
    SELECTION_ROW_CONTEXT_POLICIES[options.context],
  )
  const status = uniqueByKey([...visible.status].sort(compareStatusEntries))
  const guidance = uniqueByKey([...visible.guidance].sort(compareGuidanceEntries))
  return [
    ...status.map((entry) => statusItem(entry, options.statusTooltip)),
    ...guidance.map(guidanceItem),
  ]
}
