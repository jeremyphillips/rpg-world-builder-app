'use client'

import type { GlobalSearchDocument, GlobalSearchUrlGroup } from '@rpg/contracts'
import {
  NotificationErrorState,
  NotificationLoadingState,
  SegmentedControl,
  Text,
  type SegmentedControlOption,
} from '@rpg/ui'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'
import type { GlobalSearchGroupSection } from '../lib/rank-global-search'
import { GlobalSearchEmptyPrompt } from './global-search-empty-prompt.client'
import { GlobalSearchFlatResults, GlobalSearchGroupedResults } from './global-search-results.client'

function deriveActiveResultCount(
  group: GlobalSearchUrlGroup,
  flatResults: readonly GlobalSearchDocument[],
  groupedSections: readonly GlobalSearchGroupSection[] | null,
): number {
  if (group === 'all' && groupedSections) {
    return groupedSections.reduce((sum, section) => sum + section.totalCount, 0)
  }

  return flatResults.length
}

export type GlobalSearchResultsBodyProps = {
  query: string
  group: GlobalSearchUrlGroup
  hasQuery: boolean
  filterOptions: readonly SegmentedControlOption<GlobalSearchUrlGroup>[]
  flatResults: readonly GlobalSearchDocument[]
  groupedSections: readonly GlobalSearchGroupSection[] | null
  isPending: boolean
  isError: boolean
  onRetry: () => void
  onGroupChange: (group: GlobalSearchUrlGroup) => void
  resolveHref: (document: GlobalSearchDocument) => string
  onResultActivate?: () => void
  showAllHref?: (filterGroup: GlobalSearchGroupSection['filterGroup']) => string
  showFilter?: boolean
}

export function GlobalSearchResultsBody({
  query,
  group,
  hasQuery,
  filterOptions,
  flatResults,
  groupedSections,
  isPending,
  isError,
  onRetry,
  onGroupChange,
  resolveHref,
  onResultActivate,
  showAllHref,
  showFilter = true,
}: GlobalSearchResultsBodyProps) {
  if (isPending) {
    return <NotificationLoadingState label={GLOBAL_SEARCH_COPY.loadingCatalog} />
  }

  if (isError) {
    return (
      <NotificationErrorState
        message={GLOBAL_SEARCH_COPY.catalogLoadError}
        onRetry={onRetry}
        retryLabel={GLOBAL_SEARCH_COPY.tryAgain}
      />
    )
  }

  if (!hasQuery) {
    return <GlobalSearchEmptyPrompt />
  }

  const trimmedQuery = query.trim()
  const noResultsDescription = GLOBAL_SEARCH_COPY.noResultsDescription(trimmedQuery, group)
  const activeResultCount = deriveActiveResultCount(group, flatResults, groupedSections)

  return (
    <div className="space-y-4">
      {showFilter ? (
        <>
          <SegmentedControl
            value={group}
            options={filterOptions}
            onValueChange={onGroupChange}
            segmentWidth="auto"
            aria-label={GLOBAL_SEARCH_COPY.filterAriaLabel}
          />
          <Text as="p" variant="muted" className="text-sm">
            {GLOBAL_SEARCH_COPY.activeResultsSummary(activeResultCount, trimmedQuery)}
          </Text>
        </>
      ) : null}

      {group === 'all' && groupedSections ? (
        groupedSections.length > 0 ? (
          <GlobalSearchGroupedResults
            sections={groupedSections}
            resolveHref={resolveHref}
            onResultActivate={onResultActivate}
            showAllHref={showAllHref}
          />
        ) : (
          <GlobalSearchEmptyPrompt
            title={GLOBAL_SEARCH_COPY.noResultsTitle}
            description={noResultsDescription}
          />
        )
      ) : (
        <GlobalSearchFlatResults
          results={flatResults}
          resolveHref={resolveHref}
          onResultActivate={onResultActivate}
          emptyDescription={noResultsDescription}
        />
      )}
    </div>
  )
}
