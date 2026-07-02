/**
 * Leading chrome layout for array items — grip and/or collapse caret columns before content.
 *
 * Tokens (Tailwind spacing scale):
 * - shell inset inline: `calc(var(--spacing) * 2)` — applied on `arrayItemShellClasses`
 * - chrome hit target: `calc(var(--spacing) * 6)` — 24px, matches `size-6`
 * - gap before content column: `calc(var(--spacing) * 1)` — when any chrome is visible
 */

export const ARRAY_ITEM_CHROME_SIZE = 'calc(var(--spacing)*6)'

export interface ArrayItemLeadingChromeOptions {
  showDragHandle: boolean
  collapsible: boolean
}

export interface ResolvedArrayItemLeadingChrome {
  /** Number of leading chrome columns (0–2). Exposed as `--array-item-chrome-count` on the shell. */
  chromeCount: number
  /** Fixed-width wrapper for one grip or caret control in the toolbar flex row. */
  chromeColumnClasses: string
  /** Padding before content when chrome columns precede the content grid cell. */
  toolbarContentGapClasses: string
  /** Padding that aligns summary/body with the toolbar content column (inside main). */
  contentColumnIndentClasses: string
}

/** Fixed-width column for one leading chrome control (grip or caret). */
export const arrayItemChromeColumnClasses =
  'flex w-[calc(var(--spacing)*6)] shrink-0 items-center justify-center'

export function resolveArrayItemLeadingChrome(
  options: ArrayItemLeadingChromeOptions,
): ResolvedArrayItemLeadingChrome {
  const { showDragHandle, collapsible } = options
  const chromeCount = (showDragHandle ? 1 : 0) + (collapsible ? 1 : 0)

  const toolbarContentGapClasses = chromeCount > 0 ? 'pl-[calc(var(--spacing)*1)]' : ''

  const contentColumnIndentClasses =
    chromeCount > 0
      ? 'pl-[calc(var(--array-item-chrome-count)*var(--spacing)*6+min(1,var(--array-item-chrome-count))*var(--spacing))]'
      : ''

  return {
    chromeCount,
    chromeColumnClasses: arrayItemChromeColumnClasses,
    toolbarContentGapClasses,
    contentColumnIndentClasses,
  }
}
