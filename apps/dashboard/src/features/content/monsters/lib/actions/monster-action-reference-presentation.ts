import { MONSTER_ACTION_UNRESOLVED_REFERENCE } from '@rpg/contracts'
import { joinNaturalList } from '@rpg/contracts/primitives'

import {
  formatMonsterActionReferenceUsesSummary,
  formatMonsterActionReferenceUseTitle,
  MONSTER_ACTION_REFERENCE_CHOOSE_SOURCE,
  MONSTER_ACTION_REFERENCE_SOURCE_UNAVAILABLE,
  MONSTER_ACTION_REFERENCE_UNNAMED_TITLE,
} from '../monster-form-labels'

export type ActionReferenceSourceState = 'none' | 'resolved' | 'missing'

export interface ActionReferencePresentation {
  authoredName?: string
  /** Display title before ordinal disambiguation. */
  fallbackTitle: string
  /** Authored name, or the derived fallback when no name is stored. */
  title: string
  /** List phrase when it is not the kind label. */
  summary?: string
  sourceState: ActionReferenceSourceState
  sourceNames: readonly string[]
}

function usableSourceTitle(
  id: string,
  sourceTitles: ReadonlyMap<string, string>,
): string | undefined {
  const title = sourceTitles.get(id)?.trim()
  if (!title || title === id || title === MONSTER_ACTION_UNRESOLVED_REFERENCE) return undefined
  return title
}

function collectSourceNames(
  ids: readonly string[],
  sourceTitles: ReadonlyMap<string, string>,
): { sourceNames: string[]; unresolved: boolean } {
  const sourceNames: string[] = []
  let unresolved = false
  for (const id of ids) {
    const title = usableSourceTitle(id, sourceTitles)
    if (title) sourceNames.push(title)
    else unresolved = true
  }
  return { sourceNames, unresolved }
}

function referenceSourceState(idCount: number, unresolved: boolean): ActionReferenceSourceState {
  if (idCount === 0) return 'none'
  if (unresolved) return 'missing'
  return 'resolved'
}

function referenceFallbackTitle(sourceState: ActionReferenceSourceState, joined: string): string {
  if (sourceState === 'resolved' && joined) return formatMonsterActionReferenceUseTitle(joined)
  return MONSTER_ACTION_REFERENCE_UNNAMED_TITLE
}

function referenceSummary(
  sourceState: ActionReferenceSourceState,
  authoredName: string | undefined,
  joined: string,
): string | undefined {
  if (sourceState === 'none') return MONSTER_ACTION_REFERENCE_CHOOSE_SOURCE
  if (sourceState === 'missing') return MONSTER_ACTION_REFERENCE_SOURCE_UNAVAILABLE
  if (authoredName && joined) return formatMonsterActionReferenceUsesSummary(joined)
  return undefined
}

/** Display title and list summary for one action reference. Does not write a name. */
export function presentActionReference(input: {
  name?: string
  actionIds?: readonly string[]
  sourceTitles: ReadonlyMap<string, string>
}): ActionReferencePresentation {
  const authoredName = input.name?.trim() || undefined
  const ids = input.actionIds ?? []
  const { sourceNames, unresolved } = collectSourceNames(ids, input.sourceTitles)
  const sourceState = referenceSourceState(ids.length, unresolved)
  const joined = joinNaturalList(sourceNames, { conjunction: 'or' })
  const fallbackTitle = referenceFallbackTitle(sourceState, joined)
  const summary = referenceSummary(sourceState, authoredName, joined)

  return {
    ...(authoredName ? { authoredName } : {}),
    fallbackTitle,
    title: authoredName ?? fallbackTitle,
    ...(summary ? { summary } : {}),
    sourceState,
    sourceNames,
  }
}

/** First free title for a derived fallback. Ordinals stay off the list summary. */
export function nextDistinctTitle(base: string, taken: ReadonlySet<string>): string {
  let ordinal = 1
  let label = base
  while (taken.has(label)) {
    ordinal += 1
    label = `${base} ${ordinal}`
  }
  return label
}
