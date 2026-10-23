/** Flex fill participant for TabbedForm / Form inside ViewportWorkspace only. */
export const contentViewportFormFillClasses = 'flex min-h-0 flex-1 flex-col overflow-hidden'

/**
 * Wrapper for page heading + form — publishes the page-heading increment so dvh
 * fallback caps on descendants inherit it (not only the heading sibling).
 */
export const contentFormPageShellBodyClasses =
  'flex min-h-0 flex-1 flex-col [--rpg-content-top-inset:calc(var(--rpg-content-top-inset,0px)+4rem)]'

/**
 * Unused. Nothing applies this class. The page heading row has no styling
 * owner here; do not treat this export as that row's contract.
 */
export const contentFormPageShellHeadingClasses = 'shrink-0'
