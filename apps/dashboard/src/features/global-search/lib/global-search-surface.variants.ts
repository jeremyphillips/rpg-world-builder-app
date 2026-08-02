import { cn, establishSurfaceCurrent } from '@rpg/ui'

/** Wash ladder context for preview panel (subtle base) vs search route (faint base). */
export type GlobalSearchSurfaceContext = 'preview' | 'page'

const GLOBAL_SEARCH_HEADING_SURFACE_CLASSES: Record<GlobalSearchSurfaceContext, string> = {
  preview: 'bg-surface-muted',
  page: 'bg-surface-subtle',
}

const GLOBAL_SEARCH_ROW_HOVER_SURFACE_CLASSES: Record<GlobalSearchSurfaceContext, string> = {
  preview: 'hover:bg-surface-muted',
  page: 'hover:bg-surface-subtle',
}

export function resolveGlobalSearchHeadingSurfaceClasses(
  surfaceContext: GlobalSearchSurfaceContext,
): string {
  return GLOBAL_SEARCH_HEADING_SURFACE_CLASSES[surfaceContext]
}

export function resolveGlobalSearchRowHoverSurfaceClasses(
  surfaceContext: GlobalSearchSurfaceContext,
): string {
  return GLOBAL_SEARCH_ROW_HOVER_SURFACE_CLASSES[surfaceContext]
}

/** Route results block — faint wash on page canvas with established surface plane. */
export const globalSearchPageResultsShellClasses = cn(
  'overflow-hidden rounded-md border border-border-subtle bg-surface-faint',
  establishSurfaceCurrent('surface-faint'),
)
