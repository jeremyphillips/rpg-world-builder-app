import { describe, expect, it } from 'vitest'

import {
  arrayItemChromeColumnClasses,
  resolveArrayItemLeadingChrome,
} from './array-item-leading-chrome.lib'

describe('resolveArrayItemLeadingChrome', () => {
  it('uses shell inset only when no leading chrome is visible', () => {
    const resolved = resolveArrayItemLeadingChrome({
      reserveDragHandleSlot: false,
      collapsible: false,
    })

    expect(resolved.chromeCount).toBe(0)
    expect(resolved.shellModifierClasses).toBe('')
    expect(resolved.toolbarContentGapClasses).toBe('ui-collapsible-list-item__title')
  })

  it('keeps the caret column when the list reserves it and this row has no button', () => {
    const resolved = resolveArrayItemLeadingChrome({
      reserveDragHandleSlot: false,
      collapsible: false,
      reserveCaretSlot: true,
    })

    expect(resolved.chromeCount).toBe(1)
    expect(resolved.toolbarContentGapClasses).toContain('ui-collapsible-list-item__title')
  })

  it('reserves one chrome column and a content gap for caret-only or grip-only rows', () => {
    const caretOnly = resolveArrayItemLeadingChrome({
      reserveDragHandleSlot: false,
      collapsible: true,
    })
    const gripOnly = resolveArrayItemLeadingChrome({
      reserveDragHandleSlot: true,
      collapsible: false,
    })

    expect(caretOnly.chromeCount).toBe(1)
    expect(gripOnly.chromeCount).toBe(1)
    expect(caretOnly.chromeColumnClasses).toBe(arrayItemChromeColumnClasses)
    expect(caretOnly.toolbarContentGapClasses).toContain('ui-collapsible-list-item__title')
    expect(gripOnly.contentColumnIndentClasses).toContain('ui-collapsible-list-item__summary')
    expect(caretOnly.shellModifierClasses).toContain('ui-collapsible-list-item--caret')
    expect(gripOnly.shellModifierClasses).toContain('ui-collapsible-list-item--grip')
  })

  it('reserves two chrome columns when grip and caret are both visible', () => {
    const resolved = resolveArrayItemLeadingChrome({
      reserveDragHandleSlot: true,
      collapsible: true,
    })

    expect(resolved.chromeCount).toBe(2)
  })
})
