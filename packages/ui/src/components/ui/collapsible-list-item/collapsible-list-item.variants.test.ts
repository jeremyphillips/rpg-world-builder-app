import { describe, expect, it } from 'vitest'

import {
  collapsibleListItemContentColumnIndentClasses,
  collapsibleListItemContentInlineStartClasses,
} from './collapsible-list-item-leading-chrome.lib'
import {
  collapsibleListItemBackgroundBodyClasses,
  collapsibleListItemBodyClasses,
  collapsibleListItemCollapseButtonClasses,
  collapsibleListItemEntityCardBodyClasses,
} from './collapsible-list-item.variants'

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
    expect(classes).not.toContain('pt-3')
    expect(classes).not.toContain('pb-3')
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
    expect(classes).toContain('-ml-2')
    expect(classes).toContain('-mr-3')
    expect(classes).toContain('bg-background')
    expect(classes).toContain('pt-3')
    expect(classes).not.toContain(collapsibleListItemContentColumnIndentClasses)
  })

  it('retains catalog body bleed for catalog preset on default row layout', () => {
    const classes = collapsibleListItemBodyClasses({
      rowLayout: 'default',
      preset: 'catalog',
      collapsible: true,
    })

    expect(classes).toContain(collapsibleListItemContentInlineStartClasses)
    expect(classes).toContain('pt-3')
    expect(classes).toContain('pr-3')
  })

  it('uses the canvas plane for default array-item body wash', () => {
    expect(collapsibleListItemBackgroundBodyClasses).toContain('bg-background')
    expect(collapsibleListItemBackgroundBodyClasses).toContain('border-t')
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
