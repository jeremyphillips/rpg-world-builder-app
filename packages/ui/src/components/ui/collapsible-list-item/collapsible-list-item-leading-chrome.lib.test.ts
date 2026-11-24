import { describe, expect, it } from 'vitest'

import {
  COLLAPSIBLE_LIST_ITEM_CARET_CLASS,
  COLLAPSIBLE_LIST_ITEM_GRIP_CLASS,
  collapsibleListItemBodyInsetClasses,
  collapsibleListItemChromeColumnClasses,
  collapsibleListItemSummaryClasses,
  collapsibleListItemTitleClasses,
  resolveCollapsibleListItemLeadingChrome,
} from './collapsible-list-item-leading-chrome.lib'

describe('resolveCollapsibleListItemLeadingChrome', () => {
  it('names the caret and grip columns instead of publishing an inline style', () => {
    const resolved = resolveCollapsibleListItemLeadingChrome({
      reserveDragHandleSlot: true,
      collapsible: true,
    })

    expect(resolved.chromeCount).toBe(2)
    expect(resolved.shellModifierClasses).toContain(COLLAPSIBLE_LIST_ITEM_CARET_CLASS)
    expect(resolved.shellModifierClasses).toContain(COLLAPSIBLE_LIST_ITEM_GRIP_CLASS)
    expect(resolved.chromeColumnClasses).toBe(collapsibleListItemChromeColumnClasses)
    expect(resolved.toolbarContentGapClasses).toBe(collapsibleListItemTitleClasses)
    expect(resolved.contentColumnIndentClasses).toBe(collapsibleListItemSummaryClasses)
    expect(resolved.contentInlineStartClasses).toBe(collapsibleListItemBodyInsetClasses)
  })

  it('reserves only the caret modifier when the list keeps the column without a grip', () => {
    const resolved = resolveCollapsibleListItemLeadingChrome({
      reserveDragHandleSlot: false,
      collapsible: false,
      reserveCaretSlot: true,
    })

    expect(resolved.chromeCount).toBe(1)
    expect(resolved.shellModifierClasses).toBe(COLLAPSIBLE_LIST_ITEM_CARET_CLASS)
  })
})
