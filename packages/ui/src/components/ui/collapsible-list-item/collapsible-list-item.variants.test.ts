import { describe, expect, it } from 'vitest'

import {
  collapsibleListItemContentColumnIndentClasses,
  collapsibleListItemContentInlineStartClasses,
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
  it('drops shell bottom padding on disclosure headerActions rows', () => {
    expect(collapsibleListItemShellVariants({ layout: 'headerActions' })).toContain('pb-0')
    expect(collapsibleListItemDisclosureShellPaddingClasses).toContain('pb-0')
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
  it('owns divider and symmetric vertical rhythm without surface tone', () => {
    expect(collapsibleListItemBodyFrameClasses).toBe('border-t border-border-subtle py-3')
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

    expect(classes).toContain(collapsibleListItemContentInlineStartClasses)
    expect(classes).toContain(collapsibleListItemBodyFrameClasses)
    expect(classes).toContain('-ml-2')
    expect(classes).toContain('-mr-3')
    expect(classes).toContain('bg-background')
    expect(classes).not.toContain(collapsibleListItemContentColumnIndentClasses)
  })

  it('retains catalog body bleed for catalog preset on default row layout', () => {
    const classes = collapsibleListItemBodyClasses({
      rowLayout: 'default',
      preset: 'catalog',
      collapsible: true,
    })

    expect(classes).toContain(collapsibleListItemContentInlineStartClasses)
    expect(classes).toContain(collapsibleListItemBodyFrameClasses)
    expect(classes).toContain('pr-3')
  })

  it('uses the canvas plane for default array-item body wash', () => {
    expect(collapsibleListItemBackgroundBodyClasses).toContain('bg-background')
    expect(collapsibleListItemBackgroundBodyClasses).toContain(collapsibleListItemBodyFrameClasses)
    expect(collapsibleListItemBackgroundBodyClasses).toContain(
      '[--surface-current:var(--background)]',
    )
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
