import { GLOBAL_SEARCH_URL_GROUP_VALUES, type GlobalSearchUrlGroup } from '@rpg/contracts'

export function parseGlobalSearchUrlGroup(value: string | null | undefined): GlobalSearchUrlGroup {
  if (value && (GLOBAL_SEARCH_URL_GROUP_VALUES as readonly string[]).includes(value)) {
    return value as GlobalSearchUrlGroup
  }

  return 'all'
}

export function buildGlobalSearchPageHref(
  campaignId: string,
  options: { q?: string; group?: GlobalSearchUrlGroup } = {},
): string {
  const params = new URLSearchParams()
  const trimmedQuery = options.q?.trim()

  if (trimmedQuery) {
    params.set('q', trimmedQuery)
  }

  if (options.group && options.group !== 'all') {
    params.set('group', options.group)
  }

  const query = params.toString()
  return query ? `/campaigns/${campaignId}/search?${query}` : `/campaigns/${campaignId}/search`
}
