import { cn, establishSurfaceCurrent } from '@rpg/ui'

import { masterDetailRailBorderClasses } from './master-detail-rail.variants'

/** Single bordered surface for the detail rail. */
export const masterDetailEditorShellClasses = cn(
  'self-start overflow-hidden rounded-lg border bg-field-container text-foreground md:col-span-2',
  masterDetailRailBorderClasses,
  establishSurfaceCurrent('field-container'),
)

export const masterDetailEditorIdentityClasses = cn(
  'flex items-start justify-between gap-3 border-b px-4 py-3',
  masterDetailRailBorderClasses,
)

export const masterDetailEditorIdentityCopyClasses = 'min-w-0 space-y-0.5'

export const masterDetailEditorTitleClasses = 'truncate text-lg font-medium text-foreground'

export const masterDetailEditorMetaClasses = 'truncate text-xs text-muted-foreground'

/** Availability and selected-row issue summary share one header row (~24px gap). */
export const masterDetailEditorStatusRowClasses =
  'flex flex-wrap items-center gap-x-6 pt-0.5 text-xs'

export const masterDetailEditorIssueSummaryClasses =
  'inline-flex min-w-0 items-center gap-1 font-medium text-destructive-muted'

export const masterDetailEditorBodyClasses = 'px-4 py-4'

export const masterDetailEditorEmptyShellClasses =
  'flex min-h-48 flex-col self-start bg-transparent md:col-span-2'

export function masterDetailEditorShellClassName(className?: string): string {
  return cn(masterDetailEditorShellClasses, className)
}
