/**
 * Shared interactive outline shell — transparent fill, role-named border, neutral hover/active.
 * Used by Button `outline` variant, FilterInlineControl, and similar controls (not field inputs).
 */
export const outlineControlShellClasses =
  'rounded-md border border-interactive-outline bg-transparent transition-colors hover:bg-interactive-outline-hover active:bg-interactive-outline-active'

/** Persistent open treatment for disclosure triggers (`aria-expanded={true}`). */
export const outlineControlExpandedClasses =
  'aria-expanded:border-border aria-expanded:bg-interactive-outline-active'
