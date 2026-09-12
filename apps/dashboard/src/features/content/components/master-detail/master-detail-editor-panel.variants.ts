import { cn } from '@rpg/ui'

/** Single bordered surface for the detail rail. */
export const masterDetailEditorShellClasses =
  'overflow-hidden rounded-lg border border-border bg-card md:col-span-2'

export const masterDetailEditorIdentityClasses =
  'flex items-start justify-between gap-3 border-b border-border px-4 py-3'

export const masterDetailEditorIdentityCopyClasses = 'min-w-0 space-y-0.5'

export const masterDetailEditorTitleClasses = 'truncate text-sm font-medium text-foreground'

export const masterDetailEditorMetaClasses = 'truncate text-xs text-muted-foreground'

export const masterDetailEditorBodyClasses = 'space-y-3 px-4 py-4'

export const masterDetailEditorEmptyClasses =
  'px-4 py-6 text-sm text-muted-foreground whitespace-pre-line'

export function masterDetailEditorShellClassName(className?: string): string {
  return cn(masterDetailEditorShellClasses, className)
}
