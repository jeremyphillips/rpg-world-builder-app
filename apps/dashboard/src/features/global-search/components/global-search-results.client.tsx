'use client'

import type { GlobalSearchDocument } from '@rpg/contracts'
import { getGlobalSearchFilterGroupLabel } from '@rpg/contracts'
import { Link } from 'react-router-dom'

import { Heading, notificationMenuFooterLinkVariants } from '@rpg/ui'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'
import { isGlobalSearchCampaignUnavailable } from '../lib/global-search-result-presentation'
import { GlobalSearchEmptyPrompt } from './global-search-empty-prompt.client'
import type { GlobalSearchGroupSection } from '../lib/rank-global-search'
import { SearchResultRow } from './search-result-row.client'

export type GlobalSearchGroupedResultsProps = {
  sections: readonly GlobalSearchGroupSection[]
  resolveHref: (document: GlobalSearchDocument) => string
  onResultActivate?: () => void
  onShowAll?: (filterGroup: GlobalSearchGroupSection['filterGroup']) => void
  showAllHref?: (filterGroup: GlobalSearchGroupSection['filterGroup']) => string
}

export function GlobalSearchGroupedResults({
  sections,
  resolveHref,
  onResultActivate,
  onShowAll,
  showAllHref,
}: GlobalSearchGroupedResultsProps) {
  if (sections.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const groupLabel = getGlobalSearchFilterGroupLabel(section.filterGroup)
        const showAllTarget =
          showAllHref?.(section.filterGroup) ?? `#show-all-${section.filterGroup}`

        return (
          <section key={section.filterGroup} aria-label={groupLabel}>
            <Heading as="h2" variant="group" className="mb-2">
              {groupLabel}
            </Heading>
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
                />
              ))}
            </div>
            {section.totalCount > section.items.length ? (
              onShowAll ? (
                <button
                  type="button"
                  className={notificationMenuFooterLinkVariants({ emphasis: 'strong' })}
                  onClick={() => onShowAll(section.filterGroup)}
                >
                  {GLOBAL_SEARCH_COPY.showAllInGroup(section.totalCount, groupLabel)} →
                </button>
              ) : (
                <Link
                  to={showAllTarget}
                  className={notificationMenuFooterLinkVariants({ emphasis: 'strong' })}
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
}

export function GlobalSearchFlatResults({
  results,
  resolveHref,
  onResultActivate,
  emptyDescription,
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
        />
      ))}
    </div>
  )
}
