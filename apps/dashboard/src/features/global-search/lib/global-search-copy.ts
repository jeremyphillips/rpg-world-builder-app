export const GLOBAL_SEARCH_COPY = {
  pageTitle: 'Search',
  triggerLabel: 'Search',
  triggerShortcutHint: '⌘K',
  searchFieldLabel: 'Search campaign',
  searchFieldPlaceholder: 'Search characters, content, game terms…',
  emptyQueryTitle: 'Search this campaign',
  emptyQueryDescription: 'Find characters, catalog content, and game terms by name or keyword.',
  noResultsTitle: 'No results',
  noResultsDescription: (query: string) =>
    `Nothing matched “${query}”. Try a different spelling or keyword.`,
  catalogLoadError: 'Could not load search catalog.',
  tryAgain: 'Try again',
  viewAllResults: 'View all results',
  showAllInGroup: (count: number, groupLabel: string) => `Show all ${count} ${groupLabel}`,
  filterAriaLabel: 'Filter results by type',
  loadingCatalog: 'Loading search catalog…',
} as const
