export const globalSearchCatalogQueryKey = (campaignId: string | null | undefined) =>
  ['global-search', 'catalog', campaignId] as const
