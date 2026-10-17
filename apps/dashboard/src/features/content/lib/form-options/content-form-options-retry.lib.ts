export type ContentFormCatalogQuery = {
  isPending: boolean
  isError: boolean
  refetch: () => Promise<unknown>
}

export function failedContentFormCatalogQueries(
  queries: readonly ContentFormCatalogQuery[],
): ContentFormCatalogQuery[] {
  return queries.filter((query) => query.isError)
}

/** Refetches only queries currently in an error state. */
export async function refetchFailedContentFormCatalogQueries(
  queries: readonly ContentFormCatalogQuery[],
): Promise<void> {
  const failed = failedContentFormCatalogQueries(queries)
  await Promise.all(failed.map((query) => query.refetch()))
}
