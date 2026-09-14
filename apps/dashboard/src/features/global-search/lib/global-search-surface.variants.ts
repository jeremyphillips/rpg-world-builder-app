import { cn, establishSurfaceCurrent } from '@rpg/ui'

/** Route results block — faint wash on page canvas with established surface plane. */
export const globalSearchPageResultsShellClasses = cn(
  'overflow-hidden rounded-md border border-border-subtle bg-surface-faint',
  establishSurfaceCurrent('surface-faint'),
)
