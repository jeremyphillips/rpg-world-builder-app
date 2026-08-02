import { GLOBAL_SEARCH_URL_GROUP_VALUES, type GlobalSearchUrlGroup } from '@rpg/contracts'

export function parseGlobalSearchUrlGroup(value: string | null | undefined): GlobalSearchUrlGroup {
  if (value && (GLOBAL_SEARCH_URL_GROUP_VALUES as readonly string[]).includes(value)) {
    return value as GlobalSearchUrlGroup
  }

  return 'all'
}
