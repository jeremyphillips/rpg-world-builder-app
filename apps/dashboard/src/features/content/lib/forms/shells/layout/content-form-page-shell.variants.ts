/**
 * Flex fill participant for TabbedForm / Form inside ViewportWorkspace —
 * overflow-hidden caps content min-size for docked footer; not a scrollport.
 */
export const contentSchemaFormFillClasses = 'flex min-h-0 flex-1 flex-col overflow-hidden'

/**
 * Wrapper for page heading + form — publishes the page-heading increment so dvh
 * fallback caps on descendants inherit it (not only the heading sibling).
 */
export const contentFormPageShellBodyClasses =
  'flex min-h-0 flex-1 flex-col [--rpg-content-top-inset:calc(var(--rpg-content-top-inset,0px)+4rem)]'

/** Page heading row above the form — keep out of the bounded scroll column. */
export const contentFormPageShellHeadingClasses = 'shrink-0'
