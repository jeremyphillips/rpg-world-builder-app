import { Link } from 'react-router-dom'

import type { GlobalSearchDocument } from '@rpg/contracts'
import { cn } from '@rpg/ui'

import { GLOBAL_SEARCH_COPY } from '../../lib/global-search-copy'
import {
  globalSearchPreviewBodyClasses,
  globalSearchPreviewFooterClasses,
  globalSearchPreviewFooterLinkVariants,
  globalSearchPreviewInsetClasses,
} from '../../lib/global-search-preview.variants'
import type { GlobalSearchGroupSection } from '../../lib/rank-global-search'
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
      <p
        className={cn(
          'py-3 text-center text-sm text-muted-foreground',
          globalSearchPreviewInsetClasses,
        )}
      >
        {GLOBAL_SEARCH_COPY.loadingCatalog}
      </p>
    )
  }

  if (isError) {
    return (
      <div className={cn('space-y-3 py-3 text-center', globalSearchPreviewInsetClasses)}>
        <p className="text-sm text-muted-foreground" role="alert">
          {GLOBAL_SEARCH_COPY.catalogLoadError}
        </p>
        <button
          type="button"
          className="text-sm text-foreground underline-offset-4 hover:underline"
          onClick={onRetry}
        >
          {GLOBAL_SEARCH_COPY.tryAgain}
        </button>
      </div>
    )
  }

  if (!hasQuery) {
    return <GlobalSearchEmptyPrompt className={globalSearchPreviewInsetClasses} />
  }

  if (groupedSections.length === 0) {
    return (
      <GlobalSearchEmptyPrompt
        className={globalSearchPreviewInsetClasses}
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

function GlobalSearchPreviewFooter({ viewAllHref, onClose }: GlobalSearchPreviewFooterProps) {
  return (
    <footer className={globalSearchPreviewFooterClasses}>
      <Link to={viewAllHref} className={globalSearchPreviewFooterLinkVariants()} onClick={onClose}>
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
    <div id={id} role="region" aria-label={GLOBAL_SEARCH_COPY.pageTitle} className={className}>
      <div className={globalSearchPreviewBodyClasses}>
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
            inset="panel"
          />
        ) : null}
      </div>

      {showFooter ? (
        <GlobalSearchPreviewFooter viewAllHref={viewAllHref} onClose={onClose} />
      ) : null}
    </div>
  )
}
