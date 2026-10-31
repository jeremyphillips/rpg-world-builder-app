import type { GlobalSearchDocument } from '@rpg/contracts'
import { getGlobalSearchFilterGroupLabel } from '@rpg/contracts'
import { DestinationList, ListGroupHeading, cn } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { GLOBAL_SEARCH_COPY } from '../../lib/global-search-copy'
import {
  deriveGlobalSearchPreviewGroupFollows,
  deriveGlobalSearchPreviewGroupState,
} from '../../lib/global-search-preview-group'
import {
  globalSearchGroupSectionVariants,
  globalSearchGroupShowAllLinkVariants,
} from '../../lib/global-search-group.variants'
import { isGlobalSearchCampaignUnavailable } from '../../lib/global-search-result-presentation'
import type { GlobalSearchGroupSection as GlobalSearchGroupSectionModel } from '../../lib/rank-global-search'
import { SearchResultRow } from './global-search-result-row'

export type GlobalSearchGroupSectionProps = {
  section: GlobalSearchGroupSectionModel
  sectionIndex: number
  sections: readonly GlobalSearchGroupSectionModel[]
  resolveHref: (document: GlobalSearchDocument) => string
  onResultActivate?: () => void
  onShowAll?: (filterGroup: GlobalSearchGroupSectionModel['filterGroup']) => void
  showAllHref?: (filterGroup: GlobalSearchGroupSectionModel['filterGroup']) => string
}

export function GlobalSearchGroupSection({
  section,
  sectionIndex,
  sections,
  resolveHref,
  onResultActivate,
  onShowAll,
  showAllHref,
}: GlobalSearchGroupSectionProps) {
  const groupLabel = getGlobalSearchFilterGroupLabel(section.filterGroup)
  const state = deriveGlobalSearchPreviewGroupState(section)
  const follows = deriveGlobalSearchPreviewGroupFollows(sections, sectionIndex)
  const showGroupAction = state === 'truncated'
  const showAllTarget = showAllHref?.(section.filterGroup) ?? `#show-all-${section.filterGroup}`
  const showAllLabel = `${GLOBAL_SEARCH_COPY.showAllInGroup(section.totalCount, groupLabel)} →`
  const showAllClassName = cn(globalSearchGroupShowAllLinkVariants, 'px-3')
  const headingId = `global-search-group-${section.filterGroup}`

  return (
    <section
      aria-label={`${groupLabel}, ${section.totalCount} results`}
      className={globalSearchGroupSectionVariants({ state })}
    >
      <ListGroupHeading
        id={headingId}
        as="h2"
        label={groupLabel}
        count={section.totalCount}
        first={sectionIndex === 0}
        follows={follows}
      />

      <DestinationList appearance="embedded" density="compact">
        {section.items.map((document) => (
          <SearchResultRow
            key={document.id}
            document={document}
            href={resolveHref(document)}
            campaignUnavailable={isGlobalSearchCampaignUnavailable(document)}
            onActivate={onResultActivate}
            viewerCharacterRelationships={document.viewerCharacterRelationships}
          />
        ))}
      </DestinationList>

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
