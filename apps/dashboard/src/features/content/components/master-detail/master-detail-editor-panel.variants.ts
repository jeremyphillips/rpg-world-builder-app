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

/** Validation banner inset above the identity header. */
export const masterDetailEditorValidationBannerClasses = cn(
  'border-b px-4 py-3',
  masterDetailRailBorderClasses,
)

export const masterDetailEditorIdentityCopyClasses = 'min-w-0 space-y-0.5'

export const masterDetailEditorTitleClasses = 'truncate text-lg font-medium text-foreground'

export const masterDetailEditorMetaClasses = 'truncate text-xs text-muted-foreground'

export const masterDetailEditorAvailabilityClasses = 'pt-0.5'

export const masterDetailEditorBodyClasses = 'px-4 py-4'

export const masterDetailEditorEmptyShellClasses =
  'flex min-h-48 flex-col self-start bg-transparent md:col-span-2'

export function masterDetailEditorShellClassName(className?: string): string {
  return cn(masterDetailEditorShellClasses, className)
}
