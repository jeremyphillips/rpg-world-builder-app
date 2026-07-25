import { describe, expect, it } from 'vitest'

import {
  areColumnChangeStatesEqual,
  createPersistedColumnChangeState,
  resolveDataTableColumnOrder,
} from './data-table-column-change.lib'

describe('data-table-column-change.lib', () => {
  it('strips internal column ids from persisted snapshots', () => {
    expect(
      createPersistedColumnChangeState({ name: true, actions: true, hitDie: false }, [
        'name',
        'actions',
        'hitDie',
      ]),
    ).toEqual({
      visibility: { hitDie: false, name: true },
      order: ['name', 'hitDie'],
    })
  })

  it('treats visibility key order as equivalent', () => {
    expect(
      areColumnChangeStatesEqual(
        { visibility: { name: true, hitDie: false }, order: ['name', 'hitDie'] },
        { visibility: { hitDie: false, name: true }, order: ['name', 'hitDie'] },
      ),
    ).toBe(true)
  })

  it('prepends select and appends actions to a persisted user order', () => {
    expect(
      resolveDataTableColumnOrder({
        order: ['name', 'hitDie'],
        enableRowSelection: true,
        hasActions: true,
      }),
    ).toEqual(['select', 'name', 'hitDie', 'actions'])
  })
})
