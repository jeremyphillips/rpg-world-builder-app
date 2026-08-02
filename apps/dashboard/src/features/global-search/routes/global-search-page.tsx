'use client'

import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { NarrowPage } from '@/components/layout/narrow-page'
import { PageHeader } from '@/components/layout/page-header'
import { pageHeaderSectionGapClasses } from '@/components/layout/page-spacing.variants'

import { GlobalSearchField } from '../components/global-search-field.client'
import { GlobalSearchResultsBody } from '../components/global-search-results-body.client'
import { useGlobalSearchPage } from '../hooks/use-global-search-page'
import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'
import { resolveGlobalSearchHref } from '../lib/resolve-global-search-href'

export function GlobalSearchPage() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const {
    query,
    group,
    hasQuery,
    filterOptions,
    flatResults,
    groupedSections,
    isPending,
    isError,
    refetch,
    setQuery,
    setGroup,
  } = useGlobalSearchPage(campaignId)

  return (
    <NarrowPage spacing="compact">
      <div className={pageHeaderSectionGapClasses}>
        <PageHeader heading={GLOBAL_SEARCH_COPY.pageTitle} />
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setQuery(query)
          }}
        >
          <GlobalSearchField
            id="global-search-page-field"
            value={query}
            onValueChange={setQuery}
            onSubmit={() => setQuery(query)}
            autoFocus
          />
        </form>
      </div>

      <GlobalSearchResultsBody
        query={query}
        group={group}
        hasQuery={hasQuery}
        filterOptions={filterOptions}
        flatResults={flatResults}
        groupedSections={groupedSections}
        isPending={isPending}
        isError={isError}
        onRetry={() => {
          void refetch()
        }}
        onGroupChange={setGroup}
        resolveHref={(document) => resolveGlobalSearchHref(campaignId, document.target)}
        showAllHref={(filterGroup) =>
          ROUTES.campaign.search(campaignId, { q: query, group: filterGroup })
        }
      />
    </NarrowPage>
  )
}
