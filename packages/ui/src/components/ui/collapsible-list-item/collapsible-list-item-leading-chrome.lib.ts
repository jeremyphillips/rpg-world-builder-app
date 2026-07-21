import type { CSSProperties } from 'react'

/**
 * Leading chrome layout — grip and/or collapse caret columns before content.
 *
 * Shell exposes CSS variables (see `buildCollapsibleListItemLeadingChromeStyle`):
 * - `--leading-chrome-size` — hit target / column width (`spacing * 6`, 24px default)
 * - `--leading-chrome-gap` — gap before content text when chrome is visible
 * - `--leading-chrome-count` — number of leading chrome columns (0–2)
 * - `--shell-inline-start` — shell inline-start padding (`spacing * 2`)
 * - `--content-column-indent` — chrome columns + gap (for bodies inside shell padding)
 * - `--content-inline-start` — shell padding + chrome indent (for catalog body bleed)
 */

export const LEADING_CHROME_SIZE_VAR = '--leading-chrome-size'
export const LEADING_CHROME_GAP_VAR = '--leading-chrome-gap'
export const LEADING_CHROME_COUNT_VAR = '--leading-chrome-count'
export const SHELL_INLINE_START_VAR = '--shell-inline-start'
export const CONTENT_COLUMN_INDENT_VAR = '--content-column-indent'
export const CONTENT_INLINE_START_VAR = '--content-inline-start'

/** @deprecated Use {@link LEADING_CHROME_COUNT_VAR}. */
export const ARRAY_ITEM_CHROME_COUNT_VAR = '--array-item-chrome-count'

export const COLLAPSIBLE_LIST_ITEM_CHROME_SIZE = 'calc(var(--spacing)*6)'

export const collapsibleListItemLeadingChromeSizeValue = COLLAPSIBLE_LIST_ITEM_CHROME_SIZE
export const collapsibleListItemLeadingChromeGapValue = 'calc(var(--spacing)*1)'
export const collapsibleListItemShellInlineStartValue = 'calc(var(--spacing)*2)'

export interface CollapsibleListItemLeadingChromeOptions {
  showDragHandle: boolean
  collapsible: boolean
}

export interface ResolvedCollapsibleListItemLeadingChrome {
  /** Number of leading chrome columns (0–2). */
  chromeCount: number
  /** Fixed-width wrapper for one grip or caret control in the toolbar flex row. */
  chromeColumnClasses: string
  /** Padding before toolbar header content when chrome columns precede it. */
  toolbarContentGapClasses: string
  /** Padding that aligns summary/body with the toolbar content column (inside shell padding). */
  contentColumnIndentClasses: string
  /** Full inline-start inset from shell border (shell padding + chrome indent). */
  contentInlineStartClasses: string
}

/** Fixed-width column for one leading chrome control (grip or caret). */
export const collapsibleListItemChromeColumnClasses =
  'flex w-[var(--leading-chrome-size)] shrink-0 items-center justify-center'

export const collapsibleListItemContentColumnIndentClasses = 'pl-[var(--content-column-indent)]'

export const collapsibleListItemContentInlineStartClasses = 'pl-[var(--content-inline-start)]'

export function resolveCollapsibleListItemLeadingChrome(
  options: CollapsibleListItemLeadingChromeOptions,
): ResolvedCollapsibleListItemLeadingChrome {
  const { showDragHandle, collapsible } = options
  const chromeCount = (showDragHandle ? 1 : 0) + (collapsible ? 1 : 0)

  const toolbarContentGapClasses = chromeCount > 0 ? `pl-[var(${LEADING_CHROME_GAP_VAR})]` : ''

  const contentColumnIndentClasses =
    chromeCount > 0 ? collapsibleListItemContentColumnIndentClasses : ''

  const contentInlineStartClasses = collapsibleListItemContentInlineStartClasses

  return {
    chromeCount,
    chromeColumnClasses: collapsibleListItemChromeColumnClasses,
    toolbarContentGapClasses,
    contentColumnIndentClasses,
    contentInlineStartClasses,
  }
}

/** Restores shell inline padding when catalog body wash bleeds with negative margin. */
export const collapsibleListItemShellInlineStartClasses = `pl-[var(${SHELL_INLINE_START_VAR})]`

export function buildCollapsibleListItemLeadingChromeStyle(
  options: CollapsibleListItemLeadingChromeOptions,
): CSSProperties {
  const { chromeCount } = resolveCollapsibleListItemLeadingChrome(options)

  return {
    [LEADING_CHROME_SIZE_VAR]: collapsibleListItemLeadingChromeSizeValue,
    [LEADING_CHROME_GAP_VAR]: collapsibleListItemLeadingChromeGapValue,
    [LEADING_CHROME_COUNT_VAR]: chromeCount,
    [ARRAY_ITEM_CHROME_COUNT_VAR]: chromeCount,
    [SHELL_INLINE_START_VAR]: collapsibleListItemShellInlineStartValue,
    [CONTENT_COLUMN_INDENT_VAR]: `calc(${chromeCount} * var(${LEADING_CHROME_SIZE_VAR}) + min(1, ${chromeCount}) * var(${LEADING_CHROME_GAP_VAR}))`,
    [CONTENT_INLINE_START_VAR]: `calc(var(${SHELL_INLINE_START_VAR}) + var(${CONTENT_COLUMN_INDENT_VAR}))`,
  } as CSSProperties
}
