import type { GlobalSearchDocument } from '@rpg/contracts'

import { ListResultList } from '@rpg/ui'

import { GLOBAL_SEARCH_COPY } from '../../lib/global-search-copy'
import { isGlobalSearchCampaignUnavailable } from '../../lib/global-search-result-presentation'
import type { GlobalSearchGroupSection as GlobalSearchGroupSectionModel } from '../../lib/rank-global-search'
import { GlobalSearchEmptyPrompt } from './global-search-empty-prompt'
import { GlobalSearchGroupSection } from './global-search-group-section'
import { SearchResultRow } from './global-search-result-row'

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

  const rowDensity = inset === 'panel' ? 'compact' : 'default'

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
      rowDensity={rowDensity}
    />
  ))

  return <>{sectionElements}</>
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
    <ListResultList>
      {results.map((document) => (
        <SearchResultRow
          key={document.id}
          title={document.title}
          secondary={document.secondary}
          typeLabel={document.typeLabel}
          href={resolveHref(document)}
          campaignUnavailable={isGlobalSearchCampaignUnavailable(document)}
          onActivate={onResultActivate}
          viewerCharacterRelationships={document.viewerCharacterRelationships}
        />
      ))}
    </ListResultList>
  )
}
