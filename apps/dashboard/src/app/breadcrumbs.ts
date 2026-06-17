import type { Params } from 'react-router-dom'

export interface CrumbItem {
  label: string
  /** Omit on the final (current-page) crumb. */
  href?: string
}

/**
 * Data resolved by AppBreadcrumb and passed to each route's crumb function.
 * Add fields here when a new entity type needs a resolved label.
 */
export interface BreadcrumbData {
  /** The active campaign's display name, resolved from the query cache. */
  campaignName: string | undefined
  /**
   * A one-off entity label registered by the active detail page via
   * `useSetBreadcrumbLabel`. Covers class name, spell name, etc. — anything
   * that isn't derivable from URL params alone.
   */
  entityLabel: string | undefined
}

/**
 * Shape every route's `handle` must satisfy to participate in breadcrumbs.
 * Attach via `handle: { crumb: … }` on a `createBrowserRouter` route object.
 */
export interface CrumbHandle {
  crumb: (params: Readonly<Params<string>>, data: BreadcrumbData) => CrumbItem
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
