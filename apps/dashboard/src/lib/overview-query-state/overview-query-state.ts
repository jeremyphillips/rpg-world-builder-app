import type { FilterSchema } from '@rpg/ui/filters'
import {
  hydrateFilterState,
  stableSerializeFilterState,
  type FilterSearchParamsInput,
  serializeFilterSearchParams,
} from '@rpg/ui/filters'

export const OVERVIEW_SORT_PARAM = 'sort'
export const OVERVIEW_PAGE_PARAM = 'page'
export const OVERVIEW_DEFAULT_PAGE = 1

export type OverviewSort = {
  id: string
  desc?: boolean
}

export type OverviewQueryState<TFilters extends Record<string, unknown>> = {
  filters: TFilters
  sort?: OverviewSort
  page: number
}

export type HydrateOverviewQueryArgs<TData, TFilters extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TFilters>
  searchParams: FilterSearchParamsInput
  allowedSortIds: readonly string[]
  defaultSort?: OverviewSort
}

export type SerializeOverviewQueryArgs<TData, TFilters extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TFilters>
  query: OverviewQueryState<TFilters>
  defaultSort?: OverviewSort
}

function readSearchParam(searchParams: FilterSearchParamsInput, key: string): string | undefined {
  if (searchParams instanceof URLSearchParams) {
    const value = searchParams.get(key)
    return value === null ? undefined : value
  }

  const value = searchParams[key]
  if (value == null) return undefined
  return Array.isArray(value) ? value[0] : value
}

function isSortEqual(left: OverviewSort | undefined, right: OverviewSort | undefined): boolean {
  if (left === undefined && right === undefined) return true
  if (left === undefined || right === undefined) return false
  return left.id === right.id && Boolean(left.desc) === Boolean(right.desc)
}

function areFilterStatesEqual<TFilters extends Record<string, unknown>>(
  left: TFilters,
  right: TFilters,
): boolean {
  const leftKeys = Object.keys(left).sort()
  const rightKeys = Object.keys(right).sort()
  if (leftKeys.length !== rightKeys.length) return false

  return leftKeys.every((key, index) => {
    if (key !== rightKeys[index]) return false
    return Object.is(left[key], right[key])
  })
}

/** Deep equality for overview query snapshots — avoids redundant state writes after URL hydration. */
export function isOverviewQueryEqual<TFilters extends Record<string, unknown>>(
  left: OverviewQueryState<TFilters>,
  right: OverviewQueryState<TFilters>,
): boolean {
  if (left.page !== right.page) return false
  if (!isSortEqual(left.sort, right.sort)) return false
  return areFilterStatesEqual(left.filters, right.filters)
}

/** Stable memo key for sortable column id lists that may be reallocated each render. */
export function createAllowedSortIdsKey(allowedSortIds: readonly string[]): string {
  return allowedSortIds.join('\0')
}

/** Canonical, order-independent URL key for memo equality. */
export function createSearchParamsKey(searchParams: URLSearchParams): string {
  return [...searchParams.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}

/** Stable memo key for filter state snapshots that may be reallocated each hydration. */
export function createFilterStateKey<TData, TFilters extends Record<string, unknown>>(
  schema: FilterSchema<TData, TFilters>,
  filters: TFilters,
): string {
  return stableSerializeFilterState(schema, filters)
}

/** Parses a sort query param. Invalid or unknown ids return `undefined`. */
export function parseOverviewSort(
  raw: string | undefined,
  allowedSortIds: readonly string[],
): OverviewSort | undefined {
  if (!raw) return undefined

  const desc = raw.startsWith('-')
  const id = desc ? raw.slice(1) : raw
  if (!id || !allowedSortIds.includes(id)) return undefined

  return desc ? { id, desc: true } : { id }
}

/** Serializes sort for the URL. Omits values equal to `defaultSort`. */
export function serializeOverviewSort(
  sort: OverviewSort | undefined,
  defaultSort?: OverviewSort,
): string | undefined {
  if (!sort) return undefined
  if (isSortEqual(sort, defaultSort)) return undefined
  return sort.desc ? `-${sort.id}` : sort.id
}

/** Parses a page query param. Invalid values fall back to page 1. */
export function parseOverviewPage(raw: string | undefined): number {
  if (!raw) return OVERVIEW_DEFAULT_PAGE

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return OVERVIEW_DEFAULT_PAGE
  return parsed
}

/** Serializes page for the URL. Omits page 1. */
export function serializeOverviewPage(page: number): string | undefined {
  if (page === OVERVIEW_DEFAULT_PAGE) return undefined
  return String(page)
}

/** Hydrates filters, sort, and page from URL search params. */
export function hydrateOverviewQuery<TData, TFilters extends Record<string, unknown>>({
  schema,
  searchParams,
  allowedSortIds,
  defaultSort,
}: HydrateOverviewQueryArgs<TData, TFilters>): OverviewQueryState<TFilters> {
  const filters = hydrateFilterState(schema, searchParams)
  const sort =
    parseOverviewSort(readSearchParam(searchParams, OVERVIEW_SORT_PARAM), allowedSortIds) ??
    defaultSort
  const page = parseOverviewPage(readSearchParam(searchParams, OVERVIEW_PAGE_PARAM))

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
    params.set(OVERVIEW_SORT_PARAM, serializedSort)
  }

  const serializedPage = serializeOverviewPage(query.page)
  if (serializedPage) {
    params.set(OVERVIEW_PAGE_PARAM, serializedPage)
  }

  return params
}
