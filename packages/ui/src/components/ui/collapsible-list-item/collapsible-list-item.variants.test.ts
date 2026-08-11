import { describe, expect, it } from 'vitest'

import {
  collapsibleListItemContentColumnIndentClasses,
  collapsibleListItemContentInlineStartClasses,
} from './collapsible-list-item-leading-chrome.lib'
import {
  collapsibleListItemBodyClasses,
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

  it('retains legacy content-column indent for default row layout', () => {
    const classes = collapsibleListItemBodyClasses({
      rowLayout: 'default',
      showDragHandle: true,
      collapsible: true,
    })

    expect(classes).toContain(collapsibleListItemContentColumnIndentClasses)
    expect(classes).toContain('pt-3')
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
