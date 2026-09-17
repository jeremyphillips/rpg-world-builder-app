import { cva } from 'class-variance-authority'

import { boundedScrollRegionEndInsetClasses } from './bounded-scroll-region.variants'
import { cn } from '../../lib/utils'

/**
 * Canonical dialog panel section inset. Shared by Modal/Sheet body+footer padding
 * and (via {@link dialogPanelSectionInsetXClasses}) managed Form horizontal inset.
 * Header padding stays on `DialogPanelHeader` — do not extract a parallel header token.
 */
export const dialogPanelSectionPaddingClasses = 'p-6'

/**
 * Horizontal-only slice of {@link dialogPanelSectionPaddingClasses}.
 * Managed Form content and sheet form footers consume this — not a Form-owned padding SSOT.
 */
export const dialogPanelSectionInsetXClasses = 'px-6'

/**
 * Clip shell for default Modal/Sheet bodies — inner {@link DialogPanelScrollRegion}
 * owns overflow. Sheet adds `flex-1` via {@link sheetBodyVariants}.
 * DrawerShell `bodyMode="managed"` uses {@link dialogPanelManagedBodyVariants} instead.
 */
export const dialogPanelBodyVariants = cva(
  cn('flex min-h-0 flex-1 flex-col overflow-hidden text-sm'),
)

/**
 * Stable modal body shell — flex clip with section horizontal inset. A child
 * {@link DialogPanelScrollRegion} with `inset="inner"` owns scroll chrome only.
 * Pinned siblings may repeat {@link dialogPanelSectionInsetXClasses} for alignment.
 */
export const dialogPanelStableBodyVariants = cva(
  cn(
    'flex min-h-0 flex-1 flex-col overflow-hidden pt-0 pb-0 text-sm',
    dialogPanelSectionInsetXClasses,
  ),
)

/**
 * Stable body clip shell without horizontal inset — section inset lives on child
 * scrollports (`inset="section"`) or pinned chrome wrappers (`CreateModalShell`).
 */
export const dialogPanelStableBodyClipVariants = cva(
  cn('flex min-h-0 flex-1 flex-col overflow-hidden pt-0 pb-0 text-sm'),
)

/**
 * Managed sheet/drawer body — caller supplies the overlay scrollport (Form externalFooter,
 * composed drawer content). No padding; no auto scroll region.
 */
export const dialogPanelManagedBodyVariants = cva(
  cn('flex min-h-0 flex-1 flex-col overflow-hidden p-0 text-sm'),
)

/** Top inset for overlay scroll viewports — 20px breathing room below the header border. */
export const dialogPanelScrollRegionTopInsetClasses = 'pt-5'

/**
 * Bottom inset for inner scroll regions above a docked overlay footer — matches
 * the section padding scale from {@link dialogPanelSectionPaddingClasses}.
 */
export const dialogPanelScrollRegionBottomInsetClasses = 'pb-6'

/**
 * Inline-start inset so `ring-2` + `ring-offset-2` focus rings stay inside scroll
 * regions. Inline-end reserve lives on {@link boundedScrollRegionEndInsetClasses}.
 */
export const dialogPanelScrollRegionFocusClearanceClasses = 'ps-1'

/**
 * Section scrollport — default auto-wired Modal/Sheet body and Form `externalFooter`.
 * Viewport owns section inset; no scroll chrome (`ps-1` / `pe-2.5`).
 */
export const dialogPanelSectionScrollViewportClasses = cn(
  dialogPanelSectionInsetXClasses,
  // Counteract ScrollBoundaryRegion base `pe-2.5` — section inset stays symmetric.
  'pe-6',
  dialogPanelScrollRegionTopInsetClasses,
  dialogPanelScrollRegionBottomInsetClasses,
  'overflow-y-auto scrollbar-slim',
  'text-sm',
)

/**
 * Inner scrollport — child of a shell that already owns {@link dialogPanelSectionInsetXClasses}.
 * Viewport owns scroll chrome only; use when pinned chrome sits above the scroller.
 */
export const dialogPanelInnerScrollViewportClasses = cn(
  'min-h-0 flex-1 overflow-y-auto scrollbar-slim',
  dialogPanelScrollRegionBottomInsetClasses,
  dialogPanelScrollRegionFocusClearanceClasses,
  boundedScrollRegionEndInsetClasses,
  'text-sm',
)

/**
 * Leading inner scrollport — first content below the header border inside `stableBody`.
 * Scroll chrome plus {@link dialogPanelScrollRegionTopInsetClasses}; no section `px-6`.
 */
export const dialogPanelInnerLeadingScrollViewportClasses = cn(
  dialogPanelInnerScrollViewportClasses,
  dialogPanelScrollRegionTopInsetClasses,
)

/**
 * @deprecated Use {@link dialogPanelSectionScrollViewportClasses} or
 * {@link dialogPanelInnerScrollViewportClasses}.
 */
export const dialogPanelScrollRegionViewportClasses = dialogPanelSectionScrollViewportClasses

/**
 * Layout classes for overlay inner scroll regions inside `stableBody`.
 * Prefer {@link DialogPanelScrollRegion} with `inset="inner"`.
 *
 * @deprecated Use {@link DialogPanelScrollRegion} — kept for class-string assertions and aliases.
 */
export const dialogPanelScrollRegionClasses = cn(
  'min-h-0 flex-1',
  dialogPanelInnerScrollViewportClasses,
)

/**
 * Faint separator color shared by overlay panel header and footer section borders.
 * Pair with `border-t` on footers and `border-b` on headers.
 */
export const dialogPanelSectionSeparatorBorderClasses = 'border-border-faint'

/**
 * Overlay header section chrome — bottom separator, section inset, title stack rhythm.
 * Title typography stays on {@link DialogPanelHeader}; this token owns layout + border only.
 */
/** Header vertical inset — top matches section padding; bottom is tighter above the body. */
export const dialogPanelHeaderPaddingClasses = cn(dialogPanelSectionInsetXClasses, 'pt-6 pb-4')

export const dialogPanelHeaderClasses = cn(
  'flex shrink-0 flex-col space-y-1.5 border-b',
  dialogPanelSectionSeparatorBorderClasses,
  dialogPanelHeaderPaddingClasses,
)

/**
 * Canonical overlay footer section chrome — separator, horizontal inset, vertical rhythm.
 * Inherits panel surface fill; compose with {@link dialogPanelActionRowClasses} for actions.
 */
export const dialogPanelFooterClasses = cn(
  'flex flex-col border-t',
  dialogPanelSectionSeparatorBorderClasses,
  dialogPanelSectionInsetXClasses,
  'py-4',
)

/**
 * Footer / confirm action row layout only — no modality chrome or section padding.
 * Child helper under {@link dialogPanelFooterClasses}; not applied on the footer root.
 */
export const dialogPanelActionRowClasses = 'flex items-center justify-end gap-2'

/** Focusable dialog content shell — suppresses visible outlines when the panel receives focus. */
export const dialogContentFocusShellClasses =
  'outline-none focus:outline-none focus-visible:outline-none'
