import { describe, expect, it } from 'vitest'

import {
  collapsibleListItemBodyInsetClasses,
  collapsibleListItemSummaryClasses,
} from './collapsible-list-item-leading-chrome.lib'
import {
  collapsibleListItemBackgroundBodyClasses,
  collapsibleListItemBodyClasses,
  collapsibleListItemBodyFrameClasses,
  collapsibleListItemCollapseButtonClasses,
  collapsibleListItemDisclosureShellPaddingClasses,
  collapsibleListItemEntityCardBodyClasses,
  collapsibleListItemHeaderVerticalPaddingVariants,
  collapsibleListItemShellVariants,
} from './collapsible-list-item.variants'

describe('collapsibleListItemShellVariants', () => {
  it('keeps headerActions layout on the block and flat padding on a modifier', () => {
    expect(collapsibleListItemShellVariants({ layout: 'headerActions' })).not.toContain('flex-col')
    expect(collapsibleListItemShellVariants({ layout: 'compactRow' })).toContain(
      'ui-collapsible-list-item--flat',
    )
    expect(collapsibleListItemDisclosureShellPaddingClasses).toBe('')
  })

  it('omits preset border chrome when preset is none for entity-card hosts', () => {
    const classes = collapsibleListItemShellVariants({
      layout: 'entityCardHeaderActions',
      preset: 'none',
    })

    expect(classes).toContain('ui-collapsible-list-item--entity-card')
    expect(classes).not.toMatch(/\bborder\s+border-border\b/)
    expect(classes).not.toContain('ui-card')
  })
})

describe('collapsibleListItemHeaderVerticalPaddingVariants', () => {
  it('resolves compact and comfortable header rhythm', () => {
    expect(collapsibleListItemHeaderVerticalPaddingVariants({ density: 'compact' })).toBe('py-2')
    expect(collapsibleListItemHeaderVerticalPaddingVariants({ density: 'comfortable' })).toBe(
      'py-3',
    )
    expect(collapsibleListItemHeaderVerticalPaddingVariants()).toBe('py-2')
  })
})

describe('collapsibleListItemBodyFrameClasses', () => {
  it('points at the body element that owns divider, bleed, and fill', () => {
    expect(collapsibleListItemBodyFrameClasses).toBe('ui-collapsible-list-item__body')
  })
})

describe('collapsibleListItemBodyClasses', () => {
  it('returns structural-only classes for entity-card row layout', () => {
    const classes = collapsibleListItemBodyClasses({
      rowLayout: 'entity-card',
      showDragHandle: true,
      collapsible: true,
      preset: 'default',
    })

    expect(classes).toBe(collapsibleListItemEntityCardBodyClasses)
    expect(classes).not.toContain('content-column-indent')
    expect(classes).not.toContain('content-inline-start')
    expect(classes).not.toContain('py-3')
    expect(classes).not.toContain('pl-')
    expect(classes).not.toContain('pr-')
  })

  it('bleeds default row bodies to the shell edge with inline-start content inset', () => {
    const classes = collapsibleListItemBodyClasses({
      rowLayout: 'default',
      showDragHandle: true,
      collapsible: true,
    })

    expect(classes).toBe(collapsibleListItemBodyInsetClasses)
    expect(classes).not.toContain(collapsibleListItemSummaryClasses)
  })

  it('retains catalog body bleed for catalog preset on default row layout', () => {
    const classes = collapsibleListItemBodyClasses({
      rowLayout: 'default',
      preset: 'catalog',
      collapsible: true,
    })

    expect(classes).toBe(collapsibleListItemBodyInsetClasses)
  })

  it('uses the canvas plane for default array-item body wash', () => {
    expect(collapsibleListItemBackgroundBodyClasses).toBe(collapsibleListItemBodyInsetClasses)
  })

  it('uses pointer cursor on collapse caret controls', () => {
    expect(collapsibleListItemCollapseButtonClasses).toContain('cursor-pointer')
  })

  it('excludes catalog bleed and legacy inset for entity-card hosts even with catalog preset', () => {
    const classes = collapsibleListItemBodyClasses({
      rowLayout: 'entity-card',
      preset: 'catalog',
      showDragHandle: true,
      collapsible: true,
    })

    expect(classes).toBe(collapsibleListItemEntityCardBodyClasses)
  })
})
