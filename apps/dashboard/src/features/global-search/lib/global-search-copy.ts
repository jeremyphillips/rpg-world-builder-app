import { getGlobalSearchFilterGroupSentenceForm, type GlobalSearchUrlGroup } from '@rpg/contracts'

const NO_RESULTS_SUFFIX = 'Try a different spelling or keyword.'

export const GLOBAL_SEARCH_COPY = {
  pageTitle: 'Search',
  triggerLabel: 'Search',
  triggerShortcutHint: '⌘K',
  searchFieldLabel: 'Search campaign',
  searchFieldPlaceholder: 'Search characters, content, game terms…',
  emptyQueryTitle: 'Search this campaign',
  emptyQueryDescription: 'Find characters, catalog content, and game terms by name or keyword.',
  noResultsTitle: 'No results',
  noResultsDescription: (query: string, group: GlobalSearchUrlGroup) => {
    if (group === 'all') {
      return `Nothing matched “${query}”. ${NO_RESULTS_SUFFIX}`
    }

    const plural = getGlobalSearchFilterGroupSentenceForm(group, 2)
    return `No ${plural} matched “${query}”. ${NO_RESULTS_SUFFIX}`
  },
  activeResultsSummary: (count: number, query: string) =>
    `${count} result${count === 1 ? '' : 's'} for “${query}”`,
  catalogLoadError: 'Could not load search catalog.',
  tryAgain: 'Try again',
  viewAllResults: 'View all results',
  showAllInGroup: (count: number, groupLabel: string) => `Show all ${count} ${groupLabel}`,
  filterAriaLabel: 'Filter results by type',
  loadingCatalog: 'Loading search catalog…',
} as const
