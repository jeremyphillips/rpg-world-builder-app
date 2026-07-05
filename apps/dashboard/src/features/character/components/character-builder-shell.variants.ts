/** Route wrapper — fills the concentration viewport below padding. */
export const characterBuilderRouteClasses =
  'mx-auto flex h-dvh max-w-screen-2xl min-h-0 flex-col px-6 py-8'

/**
 * Shell root — flex column filling the route. `--character-builder-header-offset`
 * reserves space when a fixed app header is added later.
 */
export const characterBuilderShellRootClasses =
  'flex min-h-0 flex-1 flex-col gap-6 [--character-builder-header-offset:0px]'

export const characterBuilderShellHeaderClasses = 'flex shrink-0 items-center justify-between gap-4'

/** Three-column body — columns scroll independently inside the remaining height. */
export const characterBuilderShellBodyClasses =
  'grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)_minmax(14rem,18rem)]'

export const characterBuilderShellColumnClasses = 'min-h-0 min-w-0 overflow-y-auto'

export const characterBuilderShellFooterClasses =
  'shrink-0 border-t border-border bg-background py-4'

export const characterBuilderStepRailClasses = 'space-y-1'

export const characterBuilderStepRailItemClasses =
  'relative flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

export const characterBuilderStepRailItemActiveClasses =
  'bg-muted/40 before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-primary'

export const characterBuilderStepRailIconClasses = 'mt-0.5 size-4 shrink-0'

export const characterBuilderStepPanelClasses =
  'min-w-0 space-y-4 rounded-lg border border-border p-6'

export const characterBuilderPreviewPanelClasses =
  'min-w-0 space-y-4 rounded-lg border border-border bg-muted/20 p-4'

export const characterBuilderPreviewStatGridClasses = 'grid grid-cols-3 gap-3'

export const characterBuilderPreviewAbilityGridClasses = 'grid grid-cols-2 gap-2 sm:grid-cols-3'
