import { cn, establishSurfaceCurrent, interactiveFocusVariants } from '@rpg/ui'
import { formTabbedPreviewRailCompactTriggerHiddenClasses } from '@rpg/ui/form'

/**
 * Vertical rhythm between the page header and builder rails (`1rem` / 16px).
 * Published on the shell root; consumed by header padding and per-rail offsets so
 * scroll-boundary shadows have clearance below the header border; preview rail uses it
 * for bottom viewport inset.
 */
export const CHARACTER_BUILDER_HEADER_RAIL_GAP_VAR = '--character-builder-header-rail-gap'

/** Publishes {@link CHARACTER_BUILDER_HEADER_RAIL_GAP_VAR} on the shell root (`1rem` / 16px). */
export const characterBuilderHeaderRailGapTokenClasses =
  '[--character-builder-header-rail-gap:1rem]'

/** Header padding below actions/title — literal var ref so Tailwind emits the utility. */
export const characterBuilderShellHeaderBottomPaddingClasses =
  'pb-[var(--character-builder-header-rail-gap)]'

/** Margin offset for columns whose scroll chrome starts flush with the body grid (e.g. preview). */
export const characterBuilderShellRailBelowHeaderOffsetClasses =
  'mt-[var(--character-builder-header-rail-gap)]'

/** Margin above the step form `<section>` inside the scroll body — keeps the panel border off the header. */
export const characterBuilderStepPanelBelowHeaderOffsetClasses =
  'mt-[var(--character-builder-header-rail-gap)]'

/** Bottom inset for the preview rail column — keeps the card off the viewport edge. */
export const characterBuilderPreviewRailBelowViewportInsetClasses =
  'pb-[var(--character-builder-header-rail-gap)]'

/** Shell root — flex column filling the page shell body. */
export const characterBuilderShellRootClasses = cn(
  'flex min-h-0 flex-1 flex-col',
  characterBuilderHeaderRailGapTokenClasses,
)

/** Full-width chrome above the three-column body — spacing lives on the header, not flex gap. */
export const characterBuilderShellHeaderClasses = cn(
  'flex shrink-0 items-start justify-between gap-4 border-b border-border',
  characterBuilderShellHeaderBottomPaddingClasses,
)

/** Page title row — headline and persistent level control share one line when space allows. */
export const characterBuilderShellHeaderTitleRowClasses =
  'flex min-w-0 flex-1 flex-wrap items-center gap-x-8 gap-y-2'

/** Shared inter-column gap — matches {@link CHARACTER_BUILDER_HEADER_RAIL_GAP_VAR}. */
export const characterBuilderShellBodyColumnGapClasses =
  'gap-[var(--character-builder-header-rail-gap)]'

/** Column shells — no extra horizontal padding; app-shell gutter + grid gap own separation. */
export const characterBuilderShellColumnClasses = 'min-w-0 px-0'

/** Scrollport without inline-end scrollbar reserve or focus clearance inset. */
export const characterBuilderNavScrollViewportClasses =
  'min-h-0 flex-1 overflow-y-auto scrollbar-slim pe-0 ps-0'

/** Form scrollport — end-of-scroll clearance only; no horizontal inset. */
export const characterBuilderFormScrollViewportClasses =
  'h-full min-h-0 overflow-y-auto scrollbar-slim pe-0 ps-0 pb-6'

/**
 * Three-column body — step nav, form (docked footer), preview aside.
 * Preview column is hidden below `xl`; compact sheet trigger lives in the form column.
 */
export const characterBuilderShellBodyClasses = cn(
  'grid min-h-0 flex-1 grid-cols-1 overflow-hidden',
  characterBuilderShellBodyColumnGapClasses,
  // Literal strings only — Tailwind must see the full class at scan time (no template interpolation).
  'xl:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)_280px]',
  '2xl:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)_21rem]',
)

/** Left step nav — independent scroll via {@link ScrollBoundaryRegion}. */
export const characterBuilderShellNavColumnClasses = cn(
  characterBuilderShellColumnClasses,
  'flex min-h-0 flex-col',
)

/** Middle form column — bounded scroll + docked footer. */
export const characterBuilderShellFormColumnClasses = cn(
  characterBuilderShellColumnClasses,
  'flex min-h-0 flex-col overflow-hidden',
)

/** Preview aside — fill height; hidden below `xl`. */
export const characterBuilderShellPreviewColumnClasses = cn(
  characterBuilderShellColumnClasses,
  'hidden min-h-0 flex-col overflow-hidden xl:flex xl:min-h-0 xl:flex-1',
  characterBuilderShellRailBelowHeaderOffsetClasses,
  characterBuilderPreviewRailBelowViewportInsetClasses,
)

/** Top inset on the step `<nav>` — scrolls with the rail list; pairs with column scroll shadows. */
export const characterBuilderStepRailNavClasses = 'pt-[var(--character-builder-header-rail-gap)]'

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

export const characterBuilderStepPanelClasses = cn(
  'min-h-full min-w-0 space-y-4 rounded-lg border border-border bg-surface-lift p-6',
  establishSurfaceCurrent('surface-lift'),
  characterBuilderStepPanelBelowHeaderOffsetClasses,
)

export const characterBuilderPreviewCombatGridClasses = 'grid grid-cols-2 gap-3'

export const characterBuilderPreviewCombatStackClasses = 'flex flex-col gap-3'

export const characterBuilderPreviewStatGridClasses = 'grid grid-cols-3 gap-3'

export const characterBuilderPreviewAbilityGridClasses = 'grid grid-cols-2 gap-2 sm:grid-cols-3'

export const characterBuilderPreviewStatClasses = 'rounded-md border border-border px-2 py-1.5'

export const characterBuilderPreviewStatLabelClasses = 'text-xs text-muted-foreground'

export const characterBuilderPreviewStatValueClasses = 'text-sm font-medium'
