import {
  cn,
  establishSurfaceCurrent,
  interactiveFocusVariants,
  interactiveRowVariants,
} from '@rpg/ui'

import {
  masterDetailRailBorderClasses,
  masterDetailRailRowSeparatorClasses,
} from './master-detail-rail.variants'

/** Bordered collection shell for the master rail. */
export const masterDetailListShellClasses = cn(
  'overflow-hidden rounded-lg border bg-field-container text-foreground',
  masterDetailRailBorderClasses,
  establishSurfaceCurrent('field-container'),
)

/** Header row inside the shell — collection title and Add action. */
export const masterDetailListHeaderClasses = cn(
  'flex items-center justify-between gap-3 border-b px-3 py-2.5',
  masterDetailRailBorderClasses,
)

export const masterDetailListTitleClasses = 'min-w-0 text-sm font-medium text-foreground'

/** Unpadded list section — rows bleed to shell edges. */
export const masterDetailListItemsClasses = masterDetailRailRowSeparatorClasses

export function masterDetailListRowClasses(options: {
  active?: boolean
  isSelected: boolean
}): string {
  const active = options.active !== false

  return cn(
    'relative flex w-full flex-col items-start gap-0.5 border-0 py-2.5 pl-5 pr-3 text-left transition-colors',
    interactiveFocusVariants({ context: 'standalone' }),
    interactiveRowVariants({
      interaction: 'hoverable',
      state: 'default',
      hoverFamily: options.isSelected ? 'none' : 'selectable',
      selected: 'none',
      selectedHover: 'none',
    }),
    !active && 'text-muted-foreground',
    options.isSelected && 'bg-surface-muted text-foreground hover:bg-surface-muted',
    options.isSelected &&
      'before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-primary',
  )
}

export const masterDetailListRowTitleClasses =
  'min-w-0 truncate text-sm font-medium text-foreground'

export const masterDetailListRowMetaClasses = 'min-w-0 truncate text-xs text-muted-foreground'

export const masterDetailListEmptyClasses = 'px-3 py-4 text-sm text-muted-foreground'
