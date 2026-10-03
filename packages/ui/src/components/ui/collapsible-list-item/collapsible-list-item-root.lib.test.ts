import { describe, expect, it } from 'vitest'

import { resolveCollapsibleListItemHeaderActionsPlacement } from './collapsible-list-item-root.lib'

describe('resolveCollapsibleListItemHeaderActionsPlacement', () => {
  it('centers actions for entity-card hosts', () => {
    expect(resolveCollapsibleListItemHeaderActionsPlacement('default', 'entity-card')).toBe(
      'center',
    )
  })

  it('centers actions for default disclosure rows', () => {
    expect(resolveCollapsibleListItemHeaderActionsPlacement('default', 'default')).toBe('center')
  })

  it('keeps compact inline rows on the side rail', () => {
    expect(resolveCollapsibleListItemHeaderActionsPlacement('compactRow', 'default')).toBe('start')
  })
})
