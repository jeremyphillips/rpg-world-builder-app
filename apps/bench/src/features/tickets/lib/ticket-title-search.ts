import { foldAlphanumeric, matchesPrimaryTextQuery } from '@rpg/ui/lib/search-document'

export { foldAlphanumeric as normalizeTicketTitleSearchText }

export function ticketTitleMatchesSearch(title: string, search: string | undefined): boolean {
  return matchesPrimaryTextQuery(title, search ?? '', 'alphanumeric')
}
