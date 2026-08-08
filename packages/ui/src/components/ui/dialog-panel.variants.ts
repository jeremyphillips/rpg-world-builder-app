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
  cn(dialogPanelSectionPaddingClasses, 'overflow-y-auto pt-0 text-sm'),
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
