'use client'

import { Link } from 'react-router-dom'

import type { GlobalSearchDocument } from '@rpg/contracts'
import { cn, notificationMenuFooterLinkVariants } from '@rpg/ui'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'
import type { GlobalSearchGroupSection } from '../lib/rank-global-search'
import { GlobalSearchEmptyPrompt } from './global-search-empty-prompt.client'
import { GlobalSearchGroupedResults } from './global-search-results.client'

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
      <p className="py-3 text-center text-sm text-muted-foreground">
        {GLOBAL_SEARCH_COPY.loadingCatalog}
      </p>
    )
  }

  if (isError) {
    return (
      <div className="space-y-3 py-3 text-center">
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
    return <GlobalSearchEmptyPrompt />
  }

  if (groupedSections.length === 0) {
    return (
      <GlobalSearchEmptyPrompt
        title={GLOBAL_SEARCH_COPY.noResultsTitle}
        description={GLOBAL_SEARCH_COPY.noResultsDescription(query.trim())}
      />
    )
  }

  return null
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

  return (
    <div id={id} role="region" aria-label={GLOBAL_SEARCH_COPY.pageTitle} className={className}>
      <GlobalSearchPreviewStatus
        isPending={isPending}
        isError={isError}
        hasQuery={hasQuery}
        groupedSections={groupedSections}
        query={query}
        onRetry={onRetry}
      />

      {showResults ? (
        <div>
          <GlobalSearchGroupedResults
            sections={groupedSections}
            resolveHref={resolveHref}
            onResultActivate={onClose}
            showAllHref={showAllHref}
          />
        </div>
      ) : null}

      {hasQuery && resultCount > 0 ? (
        <div className={cn('border-t border-border bg-muted p-1')}>
          <Link
            to={viewAllHref}
            className={notificationMenuFooterLinkVariants({ emphasis: 'strong' })}
            onClick={onClose}
          >
            {GLOBAL_SEARCH_COPY.viewAllResults}
          </Link>
        </div>
      ) : null}
    </div>
  )
}
