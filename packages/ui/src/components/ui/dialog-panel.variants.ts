import { cva } from 'class-variance-authority'

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
 * Shared scrollable panel body. Sheet adds `flex-1` via `sheetBodyVariants`.
 * DrawerShell `bodyMode="managed"` opts out of this padding so the child re-owns inset.
 */
export const dialogPanelBodyVariants = cva(
  cn(dialogPanelSectionPaddingClasses, 'min-h-0 overflow-y-auto pt-0 text-sm'),
)

/**
 * Stable modal body shell — horizontal inset only. A flex child owns vertical
 * scroll; omit bottom padding so content sits flush above the footer.
 */
export const dialogPanelStableBodyVariants = cva(
  cn(
    dialogPanelSectionInsetXClasses,
    'flex min-h-0 flex-1 flex-col overflow-hidden pt-0 pb-0 text-sm',
  ),
)

/**
 * Bottom inset for inner scroll regions above a docked overlay footer — matches
 * the section padding scale from {@link dialogPanelSectionPaddingClasses}.
 */
export const dialogPanelScrollRegionBottomInsetClasses = 'pb-6'

/**
 * Horizontal inset so `ring-2` + `ring-offset-2` focus rings stay inside
 * `overflow-y-auto` scroll regions (see accordion section content pattern).
 */
export const dialogPanelScrollRegionFocusClearanceClasses = 'px-1'

/**
 * Inner scroll region for overlay shells with a docked footer (`stableBody`,
 * external-footer forms). The shell stays `pb-0`; this token owns end-of-scroll
 * clearance so the last block can scroll fully into view.
 */
export const dialogPanelScrollRegionClasses = cn(
  'min-h-0 flex-1 overflow-y-auto',
  dialogPanelScrollRegionBottomInsetClasses,
  dialogPanelScrollRegionFocusClearanceClasses,
)

/**
 * Canonical overlay footer section chrome — separator, horizontal inset, vertical rhythm.
 * Inherits panel surface fill; compose with {@link dialogPanelActionRowClasses} for actions.
 */
export const dialogPanelFooterClasses = cn(
  'flex flex-col border-t border-border-faint',
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
