import { describe, expect, it } from 'vitest'

import {
  buildCollapsibleListItemLeadingChromeStyle,
  CONTENT_COLUMN_INDENT_VAR,
  CONTENT_INLINE_START_VAR,
  LEADING_CHROME_COUNT_VAR,
  resolveCollapsibleListItemLeadingChrome,
} from './collapsible-list-item-leading-chrome.lib'

describe('resolveCollapsibleListItemLeadingChrome', () => {
  it('exposes content inset classes derived from CSS variables', () => {
    const resolved = resolveCollapsibleListItemLeadingChrome({
      showDragHandle: false,
      collapsible: true,
    })

    expect(resolved.contentColumnIndentClasses).toBe('pl-[var(--content-column-indent)]')
    expect(resolved.contentInlineStartClasses).toBe('pl-[var(--content-inline-start)]')
  })
})

describe('buildCollapsibleListItemLeadingChromeStyle', () => {
  it('computes count-based content inline start from chrome size and gap tokens', () => {
    const style = buildCollapsibleListItemLeadingChromeStyle({
      showDragHandle: true,
      collapsible: true,
    }) as Record<string, string | number>

    expect(style[LEADING_CHROME_COUNT_VAR]).toBe(2)
    expect(style[CONTENT_COLUMN_INDENT_VAR]).toContain('var(--leading-chrome-size)')
    expect(style[CONTENT_INLINE_START_VAR]).toContain('var(--shell-inline-start)')
    expect(style[CONTENT_INLINE_START_VAR]).toContain(`var(${CONTENT_COLUMN_INDENT_VAR})`)
  })
})
