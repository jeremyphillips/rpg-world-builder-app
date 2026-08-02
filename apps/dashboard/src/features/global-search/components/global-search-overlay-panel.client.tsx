'use client'

import { Link } from 'react-router-dom'

import type { GlobalSearchDocument } from '@rpg/contracts'
import { Modal, cn, notificationMenuFooterLinkVariants } from '@rpg/ui'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'
import type { GlobalSearchGroupSection } from '../lib/rank-global-search'
import { GlobalSearchEmptyPrompt } from './global-search-empty-prompt.client'
import { GlobalSearchField } from './global-search-field.client'
import { GlobalSearchGroupedResults } from './global-search-results.client'

type GlobalSearchOverlayStatusProps = {
  isPending: boolean
  isError: boolean
  hasQuery: boolean
  groupedSections: readonly GlobalSearchGroupSection[]
  query: string
  onRetry: () => void
}

function GlobalSearchOverlayStatus({
  isPending,
  isError,
  hasQuery,
  groupedSections,
  query,
  onRetry,
}: GlobalSearchOverlayStatusProps) {
  if (isPending) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        {GLOBAL_SEARCH_COPY.loadingCatalog}
      </p>
    )
  }

  if (isError) {
    return (
      <div className="space-y-3 py-6 text-center">
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

export type GlobalSearchOverlayPanelProps = {
  campaignId: string
  query: string
  hasQuery: boolean
  groupedSections: readonly GlobalSearchGroupSection[]
  resultCount: number
  isPending: boolean
  isError: boolean
  viewAllHref: string
  onOpenChange: (open: boolean) => void
  onQueryChange: (query: string) => void
  onRetry: () => void
  resolveHref: (document: GlobalSearchDocument) => string
  showAllHref: (filterGroup: GlobalSearchGroupSection['filterGroup']) => string
}

export function GlobalSearchOverlayPanel({
  campaignId,
  query,
  hasQuery,
  groupedSections,
  resultCount,
  isPending,
  isError,
  viewAllHref,
  onOpenChange,
  onQueryChange,
  onRetry,
  resolveHref,
  showAllHref,
}: GlobalSearchOverlayPanelProps) {
  const handleResultActivate = () => {
    onOpenChange(false)
  }

  const showResults = !isPending && !isError && hasQuery && groupedSections.length > 0

  return (
    <>
      <Modal.Header headline={GLOBAL_SEARCH_COPY.pageTitle} />
      <Modal.Body className="space-y-4">
        <GlobalSearchField
          id="global-search-overlay-field"
          value={query}
          onValueChange={onQueryChange}
          autoFocus
        />

        <GlobalSearchOverlayStatus
          isPending={isPending}
          isError={isError}
          hasQuery={hasQuery}
          groupedSections={groupedSections}
          query={query}
          onRetry={onRetry}
        />

        {showResults ? (
          <GlobalSearchGroupedResults
            campaignId={campaignId}
            sections={groupedSections}
            resolveHref={resolveHref}
            onResultActivate={handleResultActivate}
            showAllHref={showAllHref}
          />
        ) : null}
      </Modal.Body>

      {hasQuery && resultCount > 0 ? (
        <div className={cn('border-t border-border bg-muted p-1')}>
          <Link
            to={viewAllHref}
            className={notificationMenuFooterLinkVariants({ emphasis: 'strong' })}
            onClick={() => onOpenChange(false)}
          >
            {GLOBAL_SEARCH_COPY.viewAllResults}
          </Link>
        </div>
      ) : null}
    </>
  )
}
