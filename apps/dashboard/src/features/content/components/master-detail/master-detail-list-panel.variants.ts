import { cn, interactiveFocusVariants, interactiveRowVariants } from '@rpg/ui'

/** Bordered collection shell for the master rail. */
export const masterDetailListShellClasses =
  'overflow-hidden rounded-lg border border-border bg-card'

/** Header row inside the shell — collection title and Add action. */
export const masterDetailListHeaderClasses =
  'flex items-center justify-between gap-3 border-b border-border px-3 py-2.5'

export const masterDetailListTitleClasses = 'min-w-0 text-sm font-medium text-foreground'

/** Unpadded list section — rows bleed to shell edges. */
export const masterDetailListItemsClasses = 'divide-y divide-border'

export function masterDetailListRowClasses(options: {
  active?: boolean
  isSelected: boolean
}): string {
  const active = options.active !== false

  return cn(
    'relative flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors',
    interactiveFocusVariants({ context: 'standalone' }),
    interactiveRowVariants({
      interaction: 'hoverable',
      state: active ? 'default' : 'inactive',
      hoverFamily: options.isSelected ? 'none' : 'selectable',
      selected: options.isSelected ? 'fill' : 'none',
      selectedHover: options.isSelected ? 'row' : 'none',
    }),
    options.isSelected &&
      'before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-primary',
  )
}

export const masterDetailListRowTitleClasses =
  'min-w-0 truncate text-sm font-medium text-foreground'

export const masterDetailListRowMetaClasses = 'min-w-0 truncate text-xs text-muted-foreground'

export const masterDetailListEmptyClasses = 'px-3 py-4 text-sm text-muted-foreground'
