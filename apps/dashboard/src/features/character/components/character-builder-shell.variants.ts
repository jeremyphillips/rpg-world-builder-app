import { cn, interactiveFocusVariants } from '@rpg/ui'

/** Route wrapper — fills the concentration viewport below padding. */
export const characterBuilderRouteClasses =
  'mx-auto flex h-dvh max-w-screen-2xl min-h-0 flex-col px-6 py-8'

/**
 * Shell root — flex column filling the route. `--character-builder-header-offset`
 * reserves space when a fixed app header is added later.
 */
export const characterBuilderShellRootClasses =
  'flex min-h-0 flex-1 flex-col gap-6 [--character-builder-header-offset:0px]'

export const characterBuilderShellHeaderClasses = 'flex shrink-0 items-start justify-between gap-4'

/** Page title row — headline and persistent level control share one line when space allows. */
export const characterBuilderShellHeaderTitleRowClasses =
  'flex min-w-0 flex-1 flex-wrap items-center gap-x-8 gap-y-2'

/** Three-column body — columns scroll independently inside the remaining height. */
export const characterBuilderShellBodyClasses =
  'grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)_minmax(14rem,18rem)]'

export const characterBuilderShellColumnClasses = 'scrollbar-slim min-h-0 min-w-0 overflow-y-auto'

/** Preview column — defers scroll to the panel body so the eyebrow stays visible. */
export const characterBuilderShellPreviewColumnClasses =
  'flex min-h-0 min-w-0 flex-col overflow-hidden'

export const characterBuilderShellFooterClasses =
  'shrink-0 border-t border-border bg-background py-4'

export const characterBuilderStepRailClasses = 'space-y-1'

/** Host-owned navigation accent — row hover/focus only; selected left-rail stays local (F9). */
export const characterBuilderStepRailItemClasses = cn(
  'relative flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-row-hover',
  interactiveFocusVariants({ context: 'standalone' }),
)

export const characterBuilderStepRailItemActiveClasses =
  'bg-row-selected before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-primary'

export const characterBuilderStepRailItemLabelActiveClasses = 'font-semibold text-foreground'

export const characterBuilderStepRailIconClasses = 'mt-0.5 size-4 shrink-0'

export const characterBuilderPreviewAccordionTriggerClasses =
  'text-base font-medium leading-none hover:no-underline'

export const characterBuilderPreviewAccordionTriggerStackClasses =
  'flex min-w-0 flex-1 flex-col items-start gap-0.5 pr-2 text-left'

export const characterBuilderStepPanelClasses =
  'min-w-0 space-y-4 rounded-lg border border-border p-6'

export const characterBuilderPreviewPanelRootClasses = 'flex min-h-0 min-w-0 flex-1 flex-col gap-2'

/** Scrollable layout for preview inset panel — surface chrome from `InsetPanel`. */
export const characterBuilderPreviewPanelInsetClasses =
  'scrollbar-slim flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto rounded-lg'

export const characterBuilderPreviewIdentitySummaryClasses = 'space-y-1 border-b border-border pb-4'

export const characterBuilderPreviewCombatGridClasses = 'grid grid-cols-2 gap-3'

export const characterBuilderPreviewCombatStackClasses = 'flex flex-col gap-3'

export const characterBuilderPreviewStatGridClasses = 'grid grid-cols-3 gap-3'

export const characterBuilderPreviewAbilityGridClasses = 'grid grid-cols-2 gap-2 sm:grid-cols-3'
