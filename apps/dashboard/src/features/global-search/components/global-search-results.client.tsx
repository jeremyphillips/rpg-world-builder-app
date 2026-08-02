'use client'

import type { GlobalSearchDocument } from '@rpg/contracts'
import { getGlobalSearchFilterGroupLabel } from '@rpg/contracts'
import { Eyebrow, notificationMenuFooterLinkVariants } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'
import { isGlobalSearchCampaignUnavailable } from '../lib/global-search-result-presentation'
import { GlobalSearchEmptyPrompt } from './global-search-empty-prompt.client'
import { GlobalSearchPreviewGroupSection } from './global-search-preview-group-section.client'
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

  if (inset === 'panel') {
    return (
      <>
        {sections.map((section, sectionIndex) => (
          <GlobalSearchPreviewGroupSection
            key={section.filterGroup}
            section={section}
            sectionIndex={sectionIndex}
            sections={sections}
            resolveHref={resolveHref}
            onResultActivate={onResultActivate}
            onShowAll={onShowAll}
            showAllHref={showAllHref}
          />
        ))}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const groupLabel = getGlobalSearchFilterGroupLabel(section.filterGroup)
        const showAllTarget =
          showAllHref?.(section.filterGroup) ?? `#show-all-${section.filterGroup}`
        const showAllLabel = `${GLOBAL_SEARCH_COPY.showAllInGroup(section.totalCount, groupLabel)} →`

        return (
          <section key={section.filterGroup} aria-label={groupLabel}>
            <Eyebrow size="sm" className="mb-2">
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
                  {showAllLabel}
                </button>
              ) : (
                <Link
                  to={showAllTarget}
                  className={notificationMenuFooterLinkVariants({ emphasis: 'strong' })}
                >
                  {showAllLabel}
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
