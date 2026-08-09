import { describe, expect, it } from 'vitest'

import {
  mergeLocationCreateDraftForFixedCreate,
  resolveLocationFixedCreateCompositionKey,
} from './location-create-draft.lib'

describe('resolveLocationFixedCreateCompositionKey', () => {
  it('changes when settlement type changes', () => {
    expect(
      resolveLocationFixedCreateCompositionKey({
        authoringType: 'settlement',
        settlementType: 'city',
      }),
    ).not.toBe(
      resolveLocationFixedCreateCompositionKey({
        authoringType: 'settlement',
        settlementType: 'town',
      }),
    )
  })
})

describe('mergeLocationCreateDraftForFixedCreate', () => {
  it('preserves name and description across fixed-create changes', () => {
    const merged = mergeLocationCreateDraftForFixedCreate({
      currentValues: {
        name: 'Harbor Inn',
        description: 'Busy docks.',
        authoringType: 'building',
      },
      fixedCreate: {
        authoringType: 'settlement',
        settlementType: 'city',
        parent: { kind: 'fixed', locationId: 'parent-1' },
      },
    })

    expect(merged.name).toBe('Harbor Inn')
    expect(merged.description).toBe('Busy docks.')
    expect(merged.authoringType).toBe('settlement')
    expect(merged.settlementType).toBe('city')
  })
})
