import { describe, expect, it } from 'vitest'

import {
  arrayItemChromeColumnClasses,
  resolveArrayItemLeadingChrome,
} from './array-item-leading-chrome.lib'

describe('resolveArrayItemLeadingChrome', () => {
  it('uses shell inset only when no leading chrome is visible', () => {
    const resolved = resolveArrayItemLeadingChrome({
      showDragHandle: false,
      collapsible: false,
    })

    expect(resolved.chromeCount).toBe(0)
    expect(resolved.toolbarContentGapClasses).toBe('')
    expect(resolved.contentColumnIndentClasses).toBe('')
  })

  it('reserves one chrome column and a content gap for caret-only or grip-only rows', () => {
    const caretOnly = resolveArrayItemLeadingChrome({
      showDragHandle: false,
      collapsible: true,
    })
    const gripOnly = resolveArrayItemLeadingChrome({
      showDragHandle: true,
      collapsible: false,
    })

    expect(caretOnly.chromeCount).toBe(1)
    expect(gripOnly.chromeCount).toBe(1)
    expect(caretOnly.chromeColumnClasses).toBe(arrayItemChromeColumnClasses)
    expect(caretOnly.toolbarContentGapClasses).toContain('pl-[calc(var(--spacing)*1)]')
    expect(gripOnly.contentColumnIndentClasses).toContain('--array-item-chrome-count')
  })

  it('reserves two chrome columns when grip and caret are both visible', () => {
    const resolved = resolveArrayItemLeadingChrome({
      showDragHandle: true,
      collapsible: true,
    })

    expect(resolved.chromeCount).toBe(2)
  })
})
