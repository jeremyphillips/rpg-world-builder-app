import type { Params } from 'react-router-dom'

export interface CrumbItem {
  label: string
  /** Omit when the crumb represents the current page with no navigable destination. */
  href?: string
}

/**
 * Data resolved by `useResolvedBreadcrumbs` and passed to each route's crumb function.
 * Add fields here when a new entity type needs resolved context.
 */
export interface BreadcrumbData {
  /**
   * A one-off entity label registered by the active detail page via
   * `useSetBreadcrumbLabel`. Covers class name, spell name, etc. — anything
   * that isn't derivable from URL params alone.
   */
  entityLabel: string | undefined
  /** Set on edit routes via route handle metadata. */
  breadcrumbMode: 'edit' | undefined
  /** True when the deepest matched route is a collection index page. */
  isCollectionIndex: boolean
}

export interface BreadcrumbModeHandle {
  breadcrumbMode: 'edit'
}

/**
 * Shape every route's `handle` must satisfy to participate in breadcrumbs.
 * Attach via `handle: { crumb: … }` on a `createBrowserRouter` route object.
 */
export interface CrumbHandle {
  crumb: (params: Readonly<Params<string>>, data: BreadcrumbData) => CrumbItem | null
}

/** Narrow type-guard: does a route handle implement CrumbHandle? */
export function hasCrumb(handle: unknown): handle is CrumbHandle {
  return (
    typeof handle === 'object' &&
    handle !== null &&
    'crumb' in handle &&
    typeof (handle as CrumbHandle).crumb === 'function'
  )
}

export function hasBreadcrumbMode(handle: unknown): handle is BreadcrumbModeHandle {
  return (
    typeof handle === 'object' &&
    handle !== null &&
    'breadcrumbMode' in handle &&
    (handle as BreadcrumbModeHandle).breadcrumbMode === 'edit'
  )
}

/** Collection overview href — omitted on the collection index page. */
export function collectionCrumbHref(
  overviewHref: string,
  data: BreadcrumbData,
): string | undefined {
  return data.isCollectionIndex ? undefined : overviewHref
}

/** Entity detail href — provided on edit routes so the terminal entity crumb links back. */
export function entityDetailCrumbHref(
  detailHref: string,
  data: BreadcrumbData,
): string | undefined {
  return data.breadcrumbMode === 'edit' ? detailHref : undefined
}
