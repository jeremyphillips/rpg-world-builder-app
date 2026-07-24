import type { FilterSchema } from '@rpg/ui/filters'
import {
  hydrateFilterState,
  type FilterSearchParamsInput,
  serializeFilterSearchParams,
} from '@rpg/ui/filters'

export const CONTENT_OVERVIEW_SORT_PARAM = 'sort'
export const CONTENT_OVERVIEW_PAGE_PARAM = 'page'
export const CONTENT_OVERVIEW_DEFAULT_PAGE = 1

export type ContentSort = {
  id: string
  desc?: boolean
}

export type ContentOverviewQueryState<TFilters extends Record<string, unknown>> = {
  filters: TFilters
  sort?: ContentSort
  page: number
}

export type HydrateOverviewQueryArgs<TData, TFilters extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TFilters>
  searchParams: FilterSearchParamsInput
  allowedSortIds: readonly string[]
  defaultSort?: ContentSort
}

export type SerializeOverviewQueryArgs<TData, TFilters extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TFilters>
  query: ContentOverviewQueryState<TFilters>
  defaultSort?: ContentSort
}

function readSearchParam(
  searchParams: FilterSearchParamsInput,
  key: string,
): string | undefined {
  if (searchParams instanceof URLSearchParams) {
    const value = searchParams.get(key)
    return value === null ? undefined : value
  }

  const value = searchParams[key]
  if (value == null) return undefined
  return Array.isArray(value) ? value[0] : value
}

function isSortEqual(left: ContentSort | undefined, right: ContentSort | undefined): boolean {
  if (left === undefined && right === undefined) return true
  if (left === undefined || right === undefined) return false
  return left.id === right.id && Boolean(left.desc) === Boolean(right.desc)
}

/** Parses a sort query param. Invalid or unknown ids return `undefined`. */
export function parseOverviewSort(
  raw: string | undefined,
  allowedSortIds: readonly string[],
): ContentSort | undefined {
  if (!raw) return undefined

  const desc = raw.startsWith('-')
  const id = desc ? raw.slice(1) : raw
  if (!id || !allowedSortIds.includes(id)) return undefined

  return desc ? { id, desc: true } : { id }
}

/** Serializes sort for the URL. Omits values equal to `defaultSort`. */
export function serializeOverviewSort(
  sort: ContentSort | undefined,
  defaultSort?: ContentSort,
): string | undefined {
  if (!sort) return undefined
  if (isSortEqual(sort, defaultSort)) return undefined
  return sort.desc ? `-${sort.id}` : sort.id
}

/** Parses a page query param. Invalid values fall back to page 1. */
export function parseOverviewPage(raw: string | undefined): number {
  if (!raw) return CONTENT_OVERVIEW_DEFAULT_PAGE

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return CONTENT_OVERVIEW_DEFAULT_PAGE
  return parsed
}

/** Serializes page for the URL. Omits page 1. */
export function serializeOverviewPage(page: number): string | undefined {
  if (page === CONTENT_OVERVIEW_DEFAULT_PAGE) return undefined
  return String(page)
}

/** Hydrates filters, sort, and page from URL search params. */
export function hydrateOverviewQuery<TData, TFilters extends Record<string, unknown>>({
  schema,
  searchParams,
  allowedSortIds,
  defaultSort,
}: HydrateOverviewQueryArgs<TData, TFilters>): ContentOverviewQueryState<TFilters> {
  const filters = hydrateFilterState(schema, searchParams)
  const sort =
    parseOverviewSort(readSearchParam(searchParams, CONTENT_OVERVIEW_SORT_PARAM), allowedSortIds) ??
    defaultSort
  const page = parseOverviewPage(readSearchParam(searchParams, CONTENT_OVERVIEW_PAGE_PARAM))

  return { filters, sort, page }
}

/** Serializes overview query state into URL search params. */
export function serializeOverviewQuery<TData, TFilters extends Record<string, unknown>>({
  schema,
  query,
  defaultSort,
}: SerializeOverviewQueryArgs<TData, TFilters>): URLSearchParams {
  const params = serializeFilterSearchParams(schema, query.filters)

  const serializedSort = serializeOverviewSort(query.sort, defaultSort)
  if (serializedSort) {
    params.set(CONTENT_OVERVIEW_SORT_PARAM, serializedSort)
  }

  const serializedPage = serializeOverviewPage(query.page)
  if (serializedPage) {
    params.set(CONTENT_OVERVIEW_PAGE_PARAM, serializedPage)
  }

  return params
}
