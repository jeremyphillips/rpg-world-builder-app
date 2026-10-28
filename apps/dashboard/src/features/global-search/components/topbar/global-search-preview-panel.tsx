import { Link } from 'react-router-dom'

import type { GlobalSearchDocument } from '@rpg/contracts'
import { cn, Text } from '@rpg/ui'

import { GLOBAL_SEARCH_COPY } from '../../lib/global-search-copy'
import type { GlobalSearchGroupSection } from '../../lib/rank-global-search'
import { GlobalSearchResultsPanel } from '../global-search-results-panel'
import { GlobalSearchEmptyPrompt } from '../results/global-search-empty-prompt'
import { GlobalSearchGroupedResults } from '../results/global-search-result-lists'

type GlobalSearchPreviewStatusProps = {
  isPending: boolean
  isError: boolean
  hasQuery: boolean
  groupedSections: readonly GlobalSearchGroupSection[]
  query: string
  onRetry: () => void
}

function GlobalSearchPreviewStatus({
  isPending,
  isError,
  hasQuery,
  groupedSections,
  query,
  onRetry,
}: GlobalSearchPreviewStatusProps) {
  if (isPending) {
    return (
      <Text variant="supporting" className={cn('py-3 text-center', 'px-3')}>
        {GLOBAL_SEARCH_COPY.loadingCatalog}
      </Text>
    )
  }

  if (isError) {
    return (
      <div className={cn('space-y-3 py-3 text-center', 'px-3')}>
        <Text variant="supporting" role="alert">
          {GLOBAL_SEARCH_COPY.catalogLoadError}
        </Text>
        <button
          type="button"
          className="text-style-body-compact underline-offset-4 hover:underline"
          onClick={onRetry}
        >
          {GLOBAL_SEARCH_COPY.tryAgain}
        </button>
      </div>
    )
  }

  if (!hasQuery) {
    return <GlobalSearchEmptyPrompt className={'px-3'} />
  }

  if (groupedSections.length === 0) {
    return (
      <GlobalSearchEmptyPrompt
        className={'px-3'}
        title={GLOBAL_SEARCH_COPY.noResultsTitle}
        description={GLOBAL_SEARCH_COPY.noResultsDescription(query.trim(), 'all')}
      />
    )
  }

  return null
}

type GlobalSearchPreviewFooterProps = {
  viewAllHref: string
  onClose: () => void
}

const globalSearchPreviewFooterLinkClasses = cn(
  'relative flex w-full cursor-pointer select-none outline-none transition-colors',
  'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground',
  'items-center justify-center py-1.5 text-style-label',
)

function GlobalSearchPreviewFooter({ viewAllHref, onClose }: GlobalSearchPreviewFooterProps) {
  return (
    <footer className="shrink-0 border-t border-border">
      <Link to={viewAllHref} className={globalSearchPreviewFooterLinkClasses} onClick={onClose}>
        {GLOBAL_SEARCH_COPY.viewAllResults}
      </Link>
    </footer>
  )
}

export type GlobalSearchPreviewPanelProps = {
  id: string
  query: string
  hasQuery: boolean
  groupedSections: readonly GlobalSearchGroupSection[]
  resultCount: number
  isPending: boolean
  isError: boolean
  viewAllHref: string
  onClose: () => void
  onRetry: () => void
  resolveHref: (document: GlobalSearchDocument) => string
  showAllHref: (filterGroup: GlobalSearchGroupSection['filterGroup']) => string
  className?: string
}

export function GlobalSearchPreviewPanel({
  id,
  query,
  hasQuery,
  groupedSections,
  resultCount,
  isPending,
  isError,
  viewAllHref,
  onClose,
  onRetry,
  resolveHref,
  showAllHref,
  className,
}: GlobalSearchPreviewPanelProps) {
  const showResults = !isPending && !isError && hasQuery && groupedSections.length > 0
  const showFooter = hasQuery && resultCount > 0

  return (
    <GlobalSearchResultsPanel
      id={id}
      role="region"
      aria-label={GLOBAL_SEARCH_COPY.pageTitle}
      className={className}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <GlobalSearchPreviewStatus
          isPending={isPending}
          isError={isError}
          hasQuery={hasQuery}
          groupedSections={groupedSections}
          query={query}
          onRetry={onRetry}
        />

        {showResults ? (
          <GlobalSearchGroupedResults
            sections={groupedSections}
            resolveHref={resolveHref}
            onResultActivate={onClose}
            showAllHref={showAllHref}
          />
        ) : null}
      </div>

      {showFooter ? (
        <GlobalSearchPreviewFooter viewAllHref={viewAllHref} onClose={onClose} />
      ) : null}
    </GlobalSearchResultsPanel>
  )
}
