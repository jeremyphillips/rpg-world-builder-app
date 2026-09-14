import { cn, interactiveFocusVariants } from '@rpg/ui'
import {
  formTabbedAsideSlotBottomInsetClasses,
  formTabbedPreviewRailCompactTriggerHiddenClasses,
} from '@rpg/ui/form'

/** Shell root — flex column filling the page shell body. */
export const characterBuilderShellRootClasses =
  'flex min-h-0 flex-1 flex-col gap-6 [--character-builder-header-offset:0px]'

export const characterBuilderShellHeaderClasses = 'flex shrink-0 items-start justify-between gap-4'

/** Page title row — headline and persistent level control share one line when space allows. */
export const characterBuilderShellHeaderTitleRowClasses =
  'flex min-w-0 flex-1 flex-wrap items-center gap-x-8 gap-y-2'

/**
 * Three-column body — step nav, form (docked footer), preview aside.
 * Preview column is hidden below `xl`; compact sheet trigger lives in the form column.
 */
export const characterBuilderShellBodyClasses = cn(
  'grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden',
  // Literal strings only — Tailwind must see the full class at scan time (no template interpolation).
  'xl:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)_280px]',
  '2xl:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)_21rem]',
)

/** Left step nav — independent scroll. */
export const characterBuilderShellNavColumnClasses =
  'scrollbar-slim min-h-0 min-w-0 overflow-y-auto'

/** Middle form column — bounded scroll + docked footer. */
export const characterBuilderShellFormColumnClasses =
  'flex min-h-0 min-w-0 flex-col overflow-hidden'

/** Preview aside — fill height; hidden below `xl`. */
export const characterBuilderShellPreviewColumnClasses = cn(
  'hidden min-h-0 min-w-0 flex-col overflow-hidden xl:flex xl:h-full',
  formTabbedAsideSlotBottomInsetClasses,
)

/** Compact preview trigger slot — below `xl` only; no desktop margin in the form column. */
export const characterBuilderFormCompactPreviewSlotClasses =
  'mb-4 flex shrink-0 justify-end xl:hidden'

export const characterBuilderPreviewCompactTriggerClasses = cn(
  'shrink-0',
  formTabbedPreviewRailCompactTriggerHiddenClasses,
)

export const characterBuilderStepRailClasses = 'space-y-1'

/** Host-owned navigation accent — row hover/focus only; selected left-rail stays local (F9). */
export const characterBuilderStepRailItemClasses = cn(
  'relative flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-row-hover',
  interactiveFocusVariants({ context: 'standalone' }),
)

export const characterBuilderStepRailItemActiveClasses =
  'bg-row-selected before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-primary'

export const characterBuilderStepRailItemLabelActiveClasses = 'font-semibold text-foreground'

export const characterBuilderStepRailIconClasses = 'mt-0.5 shrink-0'

export const characterBuilderStepPanelClasses =
  'min-w-0 space-y-4 rounded-lg border border-border p-6'

export const characterBuilderPreviewCombatGridClasses = 'grid grid-cols-2 gap-3'

export const characterBuilderPreviewCombatStackClasses = 'flex flex-col gap-3'

export const characterBuilderPreviewStatGridClasses = 'grid grid-cols-3 gap-3'

export const characterBuilderPreviewAbilityGridClasses = 'grid grid-cols-2 gap-2 sm:grid-cols-3'
