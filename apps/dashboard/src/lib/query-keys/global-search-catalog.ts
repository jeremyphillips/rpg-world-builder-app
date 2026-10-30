/** Shared catalog snapshot key so mechanics saves can drop derived Armor Class. */
export function globalSearchCatalogQueryKey(campaignId: string | null | undefined) {
  return ['global-search', 'catalog', campaignId] as const
}
