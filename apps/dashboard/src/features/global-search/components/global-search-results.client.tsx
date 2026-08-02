'use client'

import type { GlobalSearchDocument } from '@rpg/contracts'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'
import { globalSearchResultListClasses } from '../lib/global-search-group.variants'
import { isGlobalSearchCampaignUnavailable } from '../lib/global-search-result-presentation'
import type { GlobalSearchGroupSection as GlobalSearchGroupSectionModel } from '../lib/rank-global-search'
import { GlobalSearchEmptyPrompt } from './global-search-empty-prompt.client'
import { GlobalSearchGroupSection } from './global-search-group-section.client'
import { SearchResultRow } from './search-result-row.client'

export type GlobalSearchGroupedResultsProps = {
  sections: readonly GlobalSearchGroupSectionModel[]
  resolveHref: (document: GlobalSearchDocument) => string
  onResultActivate?: () => void
  onShowAll?: (filterGroup: GlobalSearchGroupSectionModel['filterGroup']) => void
  showAllHref?: (filterGroup: GlobalSearchGroupSectionModel['filterGroup']) => string
  inset?: 'panel'
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

  const sectionElements = sections.map((section, sectionIndex) => (
    <GlobalSearchGroupSection
      key={section.filterGroup}
      section={section}
      sectionIndex={sectionIndex}
      sections={sections}
      resolveHref={resolveHref}
      onResultActivate={onResultActivate}
      onShowAll={onShowAll}
      showAllHref={showAllHref}
      inset={inset}
    />
  ))

  if (inset === 'panel') {
    return <>{sectionElements}</>
  }

  return <div className="space-y-6">{sectionElements}</div>
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
    <div className={globalSearchResultListClasses}>
      {results.map((document) => (
        <SearchResultRow
          key={document.id}
          title={document.title}
          secondary={document.secondary}
          typeLabel={document.typeLabel}
          href={resolveHref(document)}
          campaignUnavailable={isGlobalSearchCampaignUnavailable(document)}
          onActivate={onResultActivate}
          borderless
        />
      ))}
    </div>
  )
}
