import type { FilterSchema } from '@rpg/ui/filters'
import { serializeFilterSearchParams } from '@rpg/ui/filters'

/** Shared URL key for campaign scope filters. */
export const CAMPAIGN_SCOPE_FILTER_URL_KEY = 'campaignId'

export const INVALID_CAMPAIGN_SCOPE_COPY = {
  invalidHeading: 'This campaign filter is no longer available.',
  invalidBody: 'Showing all results instead.',
  invalidDismissLabel: 'Dismiss',
} as const

function collectFilterUrlKeys<TData, TFilters extends Record<string, unknown>>(
  schema: FilterSchema<TData, TFilters>,
): Set<string> {
  return new Set(schema.fields.map((field) => field.url?.key ?? field.id))
}

/** Merges serialized filter params into existing search params, preserving unrelated keys. */
export function mergeFilterSearchParams<TData, TFilters extends Record<string, unknown>>(
  schema: FilterSchema<TData, TFilters>,
  filters: TFilters,
  existing: URLSearchParams,
): URLSearchParams {
  const filterKeys = collectFilterUrlKeys(schema)
  const next = new URLSearchParams(existing)

  for (const key of filterKeys) {
    next.delete(key)
  }

  const serialized = serializeFilterSearchParams(schema, filters)
  serialized.forEach((value, key) => {
    next.set(key, value)
  })

  return next
}

/** Reads raw campaign scope from a search string without hydrating filter options. */
export function parseCampaignIdFromSearch(search: string): string | undefined {
  const value = new URLSearchParams(search).get(CAMPAIGN_SCOPE_FILTER_URL_KEY)?.trim()
  return value || undefined
}

/** Removes campaign scope from a search string while preserving unrelated params. */
export function stripCampaignIdFromSearch(search: string): string {
  const params = new URLSearchParams(search)
  params.delete(CAMPAIGN_SCOPE_FILTER_URL_KEY)
  const next = params.toString()
  return next ? `?${next}` : ''
}

export function isCampaignIdAccessible(
  campaignId: string | undefined,
  accessibleCampaignIds: readonly string[] = [],
): boolean {
  if (!campaignId) return true
  return accessibleCampaignIds.includes(campaignId)
}
