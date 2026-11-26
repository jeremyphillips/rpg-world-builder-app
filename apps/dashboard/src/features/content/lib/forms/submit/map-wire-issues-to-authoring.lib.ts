import type { FormIssue } from '@rpg/ui/form'

import type { ContentPreparedWriteProvenance } from './content-prepared-write.types'

export type WireIssueAttribution = {
  issues: FormIssue[]
  /** Wire paths whose authoring owner could not be established; kept on the semantic ancestor. */
  unattributed: string[]
}

/** Authoring path for a wire path through an explicit rename, or undefined when none applies. */
function applyPathMapInverse(
  path: string,
  pathMap: Readonly<Record<string, string>> | undefined,
): string | undefined {
  if (!pathMap) return undefined
  const entries = Object.entries(pathMap).sort(([, a], [, b]) => b.length - a.length)
  for (const [authoringPath, wirePath] of entries) {
    if (path === wirePath) return authoringPath
    if (path.startsWith(`${wirePath}.`)) return `${authoringPath}${path.slice(wirePath.length)}`
  }
  return undefined
}

type RowRemap =
  | { kind: 'mapped'; path: string }
  | { kind: 'unattributed'; ancestor: string }
  | { kind: 'uncovered' }

/**
 * Remaps a `collection.<destIndex>...` wire path to its recorded source row. The map carries row
 * identity from the actual filter/compact traversal, so equal values or equal lengths are never used.
 */
function remapCollectionRow(
  path: string,
  filtered: Readonly<Record<string, Readonly<Record<number, number>>>> | undefined,
): RowRemap {
  if (!filtered) return { kind: 'uncovered' }
  for (const [collection, sourceToDest] of Object.entries(filtered)) {
    const prefix = `${collection}.`
    if (!path.startsWith(prefix)) continue
    const rest = path.slice(prefix.length)
    const [indexSegment, ...tail] = rest.split('.')
    if (indexSegment === undefined || !/^\d+$/.test(indexSegment)) continue
    const destIndex = Number(indexSegment)
    const sourceIndex = Object.entries(sourceToDest).find(([, dest]) => dest === destIndex)?.[0]
    if (sourceIndex === undefined) return { kind: 'unattributed', ancestor: collection }
    return { kind: 'mapped', path: [collection, sourceIndex, ...tail].join('.') }
  }
  return { kind: 'uncovered' }
}

/**
 * Maps issues expressed in request (wire) space back to the authoring owner this attempt's
 * transform recorded. Paths no provenance covers pass through unchanged; a row the map cannot
 * attribute stays on its collection and is reported rather than guessed from the current index.
 */
export function mapWireIssuesToAuthoring(
  issues: readonly FormIssue[],
  provenance: ContentPreparedWriteProvenance,
): WireIssueAttribution {
  const unattributed: string[] = []
  const mapped = issues.map((issue) => {
    const renamed = applyPathMapInverse(issue.path, provenance.pathMap)
    const base = renamed ?? issue.path
    const row = remapCollectionRow(base, provenance.filteredRowIndexBySourceIndex)
    if (row.kind === 'mapped') return { ...issue, path: row.path }
    if (row.kind === 'unattributed') {
      unattributed.push(issue.path)
      return { ...issue, path: row.ancestor }
    }
    return renamed === undefined ? issue : { ...issue, path: renamed }
  })
  return { issues: mapped, unattributed }
}
