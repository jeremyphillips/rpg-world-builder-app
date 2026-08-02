'use client'

import type { GlobalSearchDocument } from '@rpg/contracts'
import { getGlobalSearchFilterGroupLabel } from '@rpg/contracts'
import { Eyebrow, cn, notificationMenuFooterLinkVariants } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'
import { globalSearchPreviewInsetClasses } from '../lib/global-search-preview.variants'
import { isGlobalSearchCampaignUnavailable } from '../lib/global-search-result-presentation'
import { GlobalSearchEmptyPrompt } from './global-search-empty-prompt.client'
import type { GlobalSearchGroupSection } from '../lib/rank-global-search'
import { SearchResultRow, type SearchResultRowInset } from './search-result-row.client'

export type GlobalSearchResultsInset = SearchResultRowInset

export type GlobalSearchGroupedResultsProps = {
  sections: readonly GlobalSearchGroupSection[]
  resolveHref: (document: GlobalSearchDocument) => string
  onResultActivate?: () => void
  onShowAll?: (filterGroup: GlobalSearchGroupSection['filterGroup']) => void
  showAllHref?: (filterGroup: GlobalSearchGroupSection['filterGroup']) => string
  inset?: GlobalSearchResultsInset
}

export function GlobalSearchGroupedResults({
  sections,
  resolveHref,
  onResultActivate,
  onShowAll,
  showAllHref,
  inset,
}: GlobalSearchGroupedResultsProps) {
  if (sections.length === 0) {
    return null
  }

  const insetClasses = inset === 'panel' ? globalSearchPreviewInsetClasses : undefined

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const groupLabel = getGlobalSearchFilterGroupLabel(section.filterGroup)
        const showAllTarget =
          showAllHref?.(section.filterGroup) ?? `#show-all-${section.filterGroup}`

        return (
          <section key={section.filterGroup} aria-label={groupLabel}>
            <Eyebrow size="sm" className={cn('mb-2', insetClasses)}>
              {groupLabel}
            </Eyebrow>
            <div>
              {section.items.map((document) => (
                <SearchResultRow
                  key={document.id}
                  title={document.title}
                  secondary={document.secondary}
                  typeLabel={document.typeLabel}
                  href={resolveHref(document)}
                  campaignUnavailable={isGlobalSearchCampaignUnavailable(document)}
                  onActivate={onResultActivate}
                  inset={inset}
                />
              ))}
            </div>
            {section.totalCount > section.items.length ? (
              onShowAll ? (
                <button
                  type="button"
                  className={cn(
                    notificationMenuFooterLinkVariants({ emphasis: 'strong' }),
                    insetClasses,
                  )}
                  onClick={() => onShowAll(section.filterGroup)}
                >
                  {GLOBAL_SEARCH_COPY.showAllInGroup(section.totalCount, groupLabel)} →
                </button>
              ) : (
                <Link
                  to={showAllTarget}
                  className={cn(
                    notificationMenuFooterLinkVariants({ emphasis: 'strong' }),
                    insetClasses,
                  )}
                >
                  {GLOBAL_SEARCH_COPY.showAllInGroup(section.totalCount, groupLabel)} →
                </Link>
              )
            ) : null}
          </section>
        )
      })}
    </div>
  )
}

export type GlobalSearchFlatResultsProps = {
  results: readonly GlobalSearchDocument[]
  resolveHref: (document: GlobalSearchDocument) => string
  onResultActivate?: () => void
  emptyDescription?: string
  inset?: GlobalSearchResultsInset
}

export function GlobalSearchFlatResults({
  results,
  resolveHref,
  onResultActivate,
  emptyDescription,
  inset,
}: GlobalSearchFlatResultsProps) {
  if (results.length === 0) {
    return (
      <GlobalSearchEmptyPrompt
        title={GLOBAL_SEARCH_COPY.noResultsTitle}
        description={emptyDescription ?? GLOBAL_SEARCH_COPY.noResultsTitle}
      />
    )
  }

  return (
    <div>
      {results.map((document) => (
        <SearchResultRow
          key={document.id}
          title={document.title}
          secondary={document.secondary}
          typeLabel={document.typeLabel}
          href={resolveHref(document)}
          campaignUnavailable={isGlobalSearchCampaignUnavailable(document)}
          onActivate={onResultActivate}
          inset={inset}
        />
      ))}
    </div>
  )
}
