/**
 * Leading chrome — grip and caret columns before the title.
 *
 * The shell wears `ui-collapsible-list-item` plus `--grip` and `--caret`.
 * Column width, title gap, summary indent, and body inset live in
 * `ui-collapsible-list-item.css`.
 */

export const COLLAPSIBLE_LIST_ITEM_BLOCK_CLASS = 'ui-collapsible-list-item'
export const COLLAPSIBLE_LIST_ITEM_CARET_CLASS = 'ui-collapsible-list-item--caret'
export const COLLAPSIBLE_LIST_ITEM_GRIP_CLASS = 'ui-collapsible-list-item--grip'

export const collapsibleListItemChromeColumnClasses = 'ui-collapsible-list-item__chrome'
export const collapsibleListItemTitleClasses = 'ui-collapsible-list-item__title'
export const collapsibleListItemSummaryClasses = 'ui-collapsible-list-item__summary'
export const collapsibleListItemBodyInsetClasses = 'ui-collapsible-list-item__body'

export interface CollapsibleListItemLeadingChromeOptions {
  /** When true, reserves leading grip column geometry in the shell. */
  reserveDragHandleSlot?: boolean
  /**
   * When true, reserves the caret column even when this row does not render a button.
   * Mixed lists keep every title on the same inset.
   */
  reserveCaretSlot?: boolean
  collapsible: boolean
}

export function resolveCollapsibleListItemReserveDragHandleSlot(
  options: CollapsibleListItemLeadingChromeOptions,
): boolean {
  return Boolean(options.reserveDragHandleSlot)
}

/** Caret column is list chrome. A row without a button still keeps the column when the list reserves it. */
export function resolveCollapsibleListItemReserveCaretSlot(
  options: CollapsibleListItemLeadingChromeOptions,
): boolean {
  return Boolean(options.reserveCaretSlot) || options.collapsible
}

export interface ResolvedCollapsibleListItemLeadingChrome {
  /** Number of leading chrome columns (0–2). */
  chromeCount: number
  /** Fixed-width wrapper for one grip or caret control in the toolbar flex row. */
  chromeColumnClasses: string
  /** Title element. Gap is owned by `--caret` / `--grip` on the shell. */
  toolbarContentGapClasses: string
  /** Summary indent. Zero when the shell reserves neither column. */
  contentColumnIndentClasses: string
  /** Body inset from the shell border. */
  contentInlineStartClasses: string
  /** Shell modifiers for the reserved columns. */
  shellModifierClasses: string
}

export function resolveCollapsibleListItemLeadingChrome(
  options: CollapsibleListItemLeadingChromeOptions,
): ResolvedCollapsibleListItemLeadingChrome {
  const reserveDragHandleSlot = resolveCollapsibleListItemReserveDragHandleSlot(options)
  const reserveCaretSlot = resolveCollapsibleListItemReserveCaretSlot(options)
  const chromeCount = (reserveDragHandleSlot ? 1 : 0) + (reserveCaretSlot ? 1 : 0)

  return {
    chromeCount,
    chromeColumnClasses: collapsibleListItemChromeColumnClasses,
    toolbarContentGapClasses: collapsibleListItemTitleClasses,
    contentColumnIndentClasses: collapsibleListItemSummaryClasses,
    contentInlineStartClasses: collapsibleListItemBodyInsetClasses,
    shellModifierClasses: [
      reserveCaretSlot ? COLLAPSIBLE_LIST_ITEM_CARET_CLASS : '',
      reserveDragHandleSlot ? COLLAPSIBLE_LIST_ITEM_GRIP_CLASS : '',
    ]
      .filter(Boolean)
      .join(' '),
  }
}
