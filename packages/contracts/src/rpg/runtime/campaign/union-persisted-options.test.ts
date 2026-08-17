import { describe, expect, it } from 'vitest'

import { unionPersistedOptions } from './union-persisted-options'

describe('unionPersistedOptions', () => {
  it('returns selectable options when there are no persisted orphans', () => {
    expect(
      unionPersistedOptions({
        selectable: [{ value: 'fighter', label: 'Fighter' }],
        persistedIds: ['fighter'],
        authorizedDisplay: new Map(),
      }),
    ).toEqual([{ value: 'fighter', label: 'Fighter' }])
  })

  it('appends authorized orphan labels without duplicating selectable values', () => {
    const result = unionPersistedOptions({
      selectable: [{ value: 'fighter', label: 'Fighter' }],
      persistedIds: ['fighter', 'wizard', 'missing-id'],
      authorizedDisplay: new Map([['wizard', { label: 'Wizard · Unavailable' }]]),
      formatUnresolvedLabel: (id) => `${id} · Unresolved`,
    })

    expect(result).toEqual([
      { value: 'fighter', label: 'Fighter' },
      { value: 'wizard', label: 'Wizard · Unavailable' },
      { value: 'missing-id', label: 'missing-id · Unresolved' },
    ])
  })

  it('does not reveal protected names when authorized display omits an id', () => {
    const result = unionPersistedOptions({
      selectable: [],
      persistedIds: ['protected-class-id'],
      authorizedDisplay: new Map(),
      formatUnresolvedLabel: () => 'Unknown reference · Unresolved',
    })

    expect(result).toEqual([
      { value: 'protected-class-id', label: 'Unknown reference · Unresolved' },
    ])
  })
})
