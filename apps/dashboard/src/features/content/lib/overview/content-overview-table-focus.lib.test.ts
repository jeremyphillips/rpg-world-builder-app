import { describe, expect, it, vi } from 'vitest'

import { focusNextOverviewRowActionTrigger } from './content-overview-table-focus.lib'

describe('focusNextOverviewRowActionTrigger', () => {
  it('focuses the next visible row trigger after removal', () => {
    const nextTrigger = { focus: vi.fn() } as unknown as HTMLButtonElement
    const refs = new Map([
      ['a', { focus: vi.fn() } as unknown as HTMLButtonElement],
      ['b', nextTrigger],
    ])

    focusNextOverviewRowActionTrigger({
      removedRowId: 'a',
      visibleRowIds: ['a', 'b'],
      actionTriggerRefs: refs,
      tableRoot: null,
    })

    expect(nextTrigger.focus).toHaveBeenCalled()
  })

  it('falls back to the table root when no trigger remains', () => {
    const tableRoot = { focus: vi.fn() } as unknown as HTMLDivElement

    focusNextOverviewRowActionTrigger({
      removedRowId: 'only',
      visibleRowIds: ['only'],
      actionTriggerRefs: new Map(),
      tableRoot,
    })

    expect(tableRoot.focus).toHaveBeenCalled()
  })
})
