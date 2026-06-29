/** Lowercases and strips non-alphanumeric characters for title search matching. */
export function normalizeTicketTitleSearchText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function ticketTitleMatchesSearch(title: string, search: string | undefined): boolean {
  const normalizedSearch = normalizeTicketTitleSearchText(search ?? '')
  if (!normalizedSearch) return true
  return normalizeTicketTitleSearchText(title).includes(normalizedSearch)
}
