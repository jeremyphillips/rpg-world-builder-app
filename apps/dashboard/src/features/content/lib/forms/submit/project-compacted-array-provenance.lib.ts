import type { ContentPreparedWriteProvenance } from './content-prepared-write.types'

/**
 * Records source → request row index correspondence after filter/compact.
 * Filtered-out source indices are omitted — they never describe the submitted request.
 */
export function projectCompactedArrayProvenance(
  collectionPath: string,
  sourceLength: number,
  keepSourceIndex: (index: number) => boolean,
): Pick<ContentPreparedWriteProvenance, 'filteredRowIndexBySourceIndex'> {
  const indexMap: Record<number, number> = {}
  let destinationIndex = 0
  for (let sourceIndex = 0; sourceIndex < sourceLength; sourceIndex++) {
    if (!keepSourceIndex(sourceIndex)) continue
    indexMap[sourceIndex] = destinationIndex
    destinationIndex += 1
  }
  return { filteredRowIndexBySourceIndex: { [collectionPath]: indexMap } }
}
