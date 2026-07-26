/**
 * Shared outline control shell — transparent fill, quiet border, neutral hover/active.
 * Used by Button `outline` variant (not field selects/inputs).
 */
export const outlineControlShellClasses =
  'rounded-md border border-outline-button-border bg-transparent transition-colors hover:bg-outline-button-hover active:bg-outline-button-active'

/** Persistent open treatment for disclosure triggers (`aria-expanded={true}`). */
export const outlineControlExpandedClasses =
  'aria-expanded:border-border aria-expanded:bg-outline-button-active'
