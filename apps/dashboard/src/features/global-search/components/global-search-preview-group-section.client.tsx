'use client'

import type { GlobalSearchDocument } from '@rpg/contracts'
import { getGlobalSearchFilterGroupLabel } from '@rpg/contracts'
import { Eyebrow, cn } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'
import {
  deriveGlobalSearchPreviewGroupFollows,
  deriveGlobalSearchPreviewGroupState,
} from '../lib/global-search-preview-group'
import {
  globalSearchPreviewGroupHeadingCountClasses,
  globalSearchPreviewGroupHeadingVariants,
  globalSearchPreviewGroupListClasses,
  globalSearchPreviewGroupVariants,
  globalSearchPreviewInsetClasses,
  globalSearchPreviewShowAllLinkVariants,
} from '../lib/global-search-preview.variants'
import { isGlobalSearchCampaignUnavailable } from '../lib/global-search-result-presentation'
import type { GlobalSearchGroupSection } from '../lib/rank-global-search'
import { SearchResultRow } from './search-result-row.client'

export type GlobalSearchPreviewGroupSectionProps = {
  section: GlobalSearchGroupSection
  sectionIndex: number
  sections: readonly GlobalSearchGroupSection[]
  resolveHref: (document: GlobalSearchDocument) => string
  onResultActivate?: () => void
  onShowAll?: (filterGroup: GlobalSearchGroupSection['filterGroup']) => void
  showAllHref?: (filterGroup: GlobalSearchGroupSection['filterGroup']) => string
}

export function GlobalSearchPreviewGroupSection({
  section,
  sectionIndex,
  sections,
  resolveHref,
  onResultActivate,
  onShowAll,
  showAllHref,
}: GlobalSearchPreviewGroupSectionProps) {
  const groupLabel = getGlobalSearchFilterGroupLabel(section.filterGroup)
  const state = deriveGlobalSearchPreviewGroupState(section)
  const follows = deriveGlobalSearchPreviewGroupFollows(sections, sectionIndex)
  const showGroupAction = state === 'truncated'
  const showAllTarget = showAllHref?.(section.filterGroup) ?? `#show-all-${section.filterGroup}`
  const showAllLabel = `${GLOBAL_SEARCH_COPY.showAllInGroup(section.totalCount, groupLabel)} →`
  const showAllClassName = cn(
    globalSearchPreviewShowAllLinkVariants(),
    globalSearchPreviewInsetClasses,
  )

  return (
    <section
      aria-label={`${groupLabel}, ${section.totalCount} results`}
      className={globalSearchPreviewGroupVariants({ state })}
    >
      <div
        className={globalSearchPreviewGroupHeadingVariants({
          first: sectionIndex === 0,
          follows,
        })}
      >
        <Eyebrow size="sm" className={globalSearchPreviewInsetClasses}>
          {groupLabel}
          <span className={globalSearchPreviewGroupHeadingCountClasses}>
            {' · '}
            {section.totalCount}
          </span>
        </Eyebrow>
      </div>

      <div className={globalSearchPreviewGroupListClasses}>
        {section.items.map((document) => (
          <SearchResultRow
            key={document.id}
            title={document.title}
            secondary={document.secondary}
            typeLabel={document.typeLabel}
            href={resolveHref(document)}
            campaignUnavailable={isGlobalSearchCampaignUnavailable(document)}
            onActivate={onResultActivate}
            inset="panel"
          />
        ))}
      </div>

      {showGroupAction ? (
        onShowAll ? (
          <button
            type="button"
            className={showAllClassName}
            onClick={() => onShowAll(section.filterGroup)}
          >
            {showAllLabel}
          </button>
        ) : (
          <Link to={showAllTarget} className={showAllClassName}>
            {showAllLabel}
          </Link>
        )
      ) : null}
    </section>
  )
}
