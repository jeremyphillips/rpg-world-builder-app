export type ContentPreparedWritePathMap = Record<string, string>

export type ContentFilteredRowIndexMap = Record<number, number>

export type ContentPreparedWriteProvenance = {
  /** Sparse authoring → wire path overrides when shapes diverge. */
  pathMap?: ContentPreparedWritePathMap
  /** Source row index → surviving request index after filter/compact per collection path. */
  filteredRowIndexBySourceIndex?: Record<string, ContentFilteredRowIndexMap>
}

export type ContentPreparedWrite<TPayload = unknown> = {
  payload: TPayload
  provenance: ContentPreparedWriteProvenance
}

export function buildIdentityPreparedWrite<TPayload>(
  payload: TPayload,
): ContentPreparedWrite<TPayload> {
  return { payload, provenance: {} }
}

export function assertContentPreparedWritePairing<TPayload extends Record<string, unknown>>(
  prepared: ContentPreparedWrite<TPayload>,
): void {
  const { pathMap, filteredRowIndexBySourceIndex } = prepared.provenance
  if (pathMap) {
    for (const [authoringPath, wirePath] of Object.entries(pathMap)) {
      if (!authoringPath.trim()) {
        throw new Error('Prepared write path map keys must be non-empty.')
      }
      if (!wirePath.trim()) {
        throw new Error(`Prepared write path map for "${authoringPath}" must have a wire path.`)
      }
    }
  }
  if (filteredRowIndexBySourceIndex) {
    for (const [collectionPath, indexMap] of Object.entries(filteredRowIndexBySourceIndex)) {
      if (!collectionPath.trim()) {
        throw new Error('Filtered row provenance requires a collection path.')
      }
      for (const [sourceIndex, destIndex] of Object.entries(indexMap)) {
        if (Number(sourceIndex) < 0 || destIndex < 0) {
          throw new Error(`Invalid row index mapping for "${collectionPath}".`)
        }
      }
    }
  }
}
