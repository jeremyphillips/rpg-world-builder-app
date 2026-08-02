'use client'

import * as React from 'react'

import {
  buildGlobalSearchGroupSections,
  isGlobalSearchQueryBlank,
  rankGlobalSearchDocuments,
  type GlobalSearchGroupSection,
} from '../lib/rank-global-search'
import { OVERLAY_GROUP_PREVIEW_LIMIT } from '../lib/global-search-constants'
import { useGlobalSearchCatalog } from './use-global-search-catalog'

export function useGlobalSearchTopbar(campaignId: string, open: boolean) {
  const [query, setQuery] = React.useState('')
  const { data, isPending, isError, refetch } = useGlobalSearchCatalog(campaignId)

  React.useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  const documents = data?.documents ?? []
  const hasQuery = !isGlobalSearchQueryBlank(query)

  const rankedDocuments = React.useMemo(
    () => rankGlobalSearchDocuments(documents, query),
    [documents, query],
  )

  const groupedSections = React.useMemo<GlobalSearchGroupSection[]>(() => {
    if (!hasQuery) return []
    return buildGlobalSearchGroupSections(rankedDocuments, OVERLAY_GROUP_PREVIEW_LIMIT)
  }, [hasQuery, rankedDocuments])

  return {
    query,
    hasQuery,
    groupedSections,
    resultCount: rankedDocuments.length,
    isPending,
    isError,
    refetch,
    setQuery,
  }
}
