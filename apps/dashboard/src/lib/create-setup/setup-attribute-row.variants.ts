import { cn } from '@rpg/ui'

/** Attribute row in editable setup/build surfaces (e.g. Quick NPC build card). */
export const setupAttributeRowClasses = cn(
  'flex flex-col border-b border-border pb-2.5 mb-2.5 last:border-b-0 last:mb-0 last:pb-0',
)

export const setupAttributeRowHeaderClasses = cn(
  'flex min-h-control-action-compact flex-wrap items-center justify-between gap-2',
)

export const setupAttributeRowValueClasses = cn('text-base font-body-emphasis text-foreground')

export const setupAttributeRowBodyClasses = cn('flex flex-col gap-y-3')

export const setupAttributeRowEditorShellClasses = cn('flex flex-wrap items-center gap-3')
