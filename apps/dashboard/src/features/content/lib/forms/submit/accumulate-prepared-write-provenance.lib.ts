import type { ContentPreparedWriteProvenance } from './content-prepared-write.types'
import { projectCompactedArrayProvenance } from './project-compacted-array-provenance.lib'

export type ProvenanceAccumulator = {
  filteredRowIndexBySourceIndex: Record<string, Record<number, number>>
  pathMap: Record<string, string>
}

export function createProvenanceAccumulator(): ProvenanceAccumulator {
  return { filteredRowIndexBySourceIndex: {}, pathMap: {} }
}

export function mergeProvenancePart(
  acc: ProvenanceAccumulator,
  part: Partial<ContentPreparedWriteProvenance>,
): void {
  if (part.pathMap) {
    Object.assign(acc.pathMap, part.pathMap)
  }
  if (part.filteredRowIndexBySourceIndex) {
    for (const [collection, indexMap] of Object.entries(part.filteredRowIndexBySourceIndex)) {
      acc.filteredRowIndexBySourceIndex[collection] = {
        ...(acc.filteredRowIndexBySourceIndex[collection] ?? {}),
        ...indexMap,
      }
    }
  }
}

export function recordArrayCompaction(
  acc: ProvenanceAccumulator,
  collectionPath: string,
  sourceLength: number,
  keepSourceIndex: (index: number) => boolean,
): void {
  const dropped = Array.from({ length: sourceLength }, (_, index) => index).some(
    (index) => !keepSourceIndex(index),
  )
  if (!dropped && sourceLength === 0) return
  if (!dropped) return
  mergeProvenancePart(
    acc,
    projectCompactedArrayProvenance(collectionPath, sourceLength, keepSourceIndex),
  )
}

export function finishProvenanceAccumulator(
  acc: ProvenanceAccumulator,
): ContentPreparedWriteProvenance {
  const provenance: ContentPreparedWriteProvenance = {}
  if (Object.keys(acc.pathMap).length > 0) provenance.pathMap = { ...acc.pathMap }
  if (Object.keys(acc.filteredRowIndexBySourceIndex).length > 0) {
    provenance.filteredRowIndexBySourceIndex = { ...acc.filteredRowIndexBySourceIndex }
  }
  return provenance
}
