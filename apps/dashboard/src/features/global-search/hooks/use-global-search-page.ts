'use client'

import * as React from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  GLOBAL_SEARCH_FILTER_GROUPS,
  getGlobalSearchFilterGroupLabel,
  type GlobalSearchUrlGroup,
} from '@rpg/contracts'
import type { SegmentedControlOption } from '@rpg/ui'

import {
  buildGlobalSearchGroupSections,
  filterGlobalSearchByGroup,
  isGlobalSearchQueryBlank,
  rankGlobalSearchDocuments,
  type GlobalSearchGroupSection,
} from '../lib/rank-global-search'
import { PAGE_GROUP_PREVIEW_LIMIT } from '../lib/global-search-constants'
import { parseGlobalSearchUrlGroup } from '../lib/global-search-url'
import { useGlobalSearchCatalog } from './use-global-search-catalog'

export function useGlobalSearchPage(campaignId: string) {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const group = parseGlobalSearchUrlGroup(searchParams.get('group'))
  const { data, isPending, isError, refetch } = useGlobalSearchCatalog(campaignId)

  const documents = data?.documents ?? []
  const hasQuery = !isGlobalSearchQueryBlank(query)

  const rankedDocuments = React.useMemo(
    () => rankGlobalSearchDocuments(documents, query),
    [documents, query],
  )

  const flatResults = React.useMemo(
    () => filterGlobalSearchByGroup(rankedDocuments, group),
    [group, rankedDocuments],
  )

  const groupedSections = React.useMemo<GlobalSearchGroupSection[] | null>(() => {
    if (!hasQuery || group !== 'all') return null
    return buildGlobalSearchGroupSections(rankedDocuments, PAGE_GROUP_PREVIEW_LIMIT)
  }, [group, hasQuery, rankedDocuments])

  const filterOptions = React.useMemo<readonly SegmentedControlOption<GlobalSearchUrlGroup>[]>(
    () => [
      { value: 'all', label: 'All' },
      ...GLOBAL_SEARCH_FILTER_GROUPS.map((filterGroup) => ({
        value: filterGroup,
        label: getGlobalSearchFilterGroupLabel(filterGroup),
      })),
    ],
    [],
  )

  const setQuery = React.useCallback(
    (nextQuery: string) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          const trimmed = nextQuery.trim()

          if (trimmed) {
            params.set('q', trimmed)
          } else {
            params.delete('q')
          }

          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setGroup = React.useCallback(
    (nextGroup: GlobalSearchUrlGroup) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)

          if (nextGroup === 'all') {
            params.delete('group')
          } else {
            params.set('group', nextGroup)
          }

          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return {
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
  }
}
