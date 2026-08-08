import { describe, expect, it } from 'vitest'

import { HARBORFORD, DOCK_WARD } from '../fixtures'
import {
  completeLocationCreateSetup,
  fixedCreateFromIntent,
  resolveLocationCreateSession,
} from './location-create-session'

describe('resolveLocationCreateSession', () => {
  it('returns ready immediately for types without setup', () => {
    expect(resolveLocationCreateSession({ authoringType: 'building' })).toEqual({
      status: 'ready',
      fixedCreate: { authoringType: 'building' },
    })
  })

  it('returns needsSetup for settlement', () => {
    expect(resolveLocationCreateSession({ authoringType: 'settlement' })).toEqual({
      status: 'needsSetup',
    })
  })

  it('includes fixed parent for contained create intents', () => {
    expect(
      resolveLocationCreateSession({
        authoringType: 'building',
        parentLocationId: HARBORFORD.id,
      }),
    ).toEqual({
      status: 'ready',
      fixedCreate: {
        authoringType: 'building',
        parent: { kind: 'fixed', locationId: HARBORFORD.id },
      },
    })
  })
})

describe('completeLocationCreateSetup', () => {
  it('merges setup result into fixed create context deterministically', () => {
    expect(
      completeLocationCreateSetup(
        { authoringType: 'settlement', parentLocationId: DOCK_WARD.id },
        { settlementType: 'city' },
      ),
    ).toEqual({
      authoringType: 'settlement',
      parent: { kind: 'fixed', locationId: DOCK_WARD.id },
      settlementType: 'city',
    })
  })

  it('does not require navigation or shell state', () => {
    const result = completeLocationCreateSetup(
      { authoringType: 'settlement' },
      {
        settlementType: 'town',
      },
    )
    expect(fixedCreateFromIntent({ authoringType: 'settlement' })).toEqual({
      authoringType: 'settlement',
    })
    expect(result.settlementType).toBe('town')
  })
})

describe('parent/type distinction', () => {
  it('overview building keeps parent editable', () => {
    expect(fixedCreateFromIntent({ authoringType: 'building' })).toEqual({
      authoringType: 'building',
    })
  })

  it('contained building fixes parent', () => {
    expect(
      fixedCreateFromIntent({ authoringType: 'building', parentLocationId: HARBORFORD.id }),
    ).toEqual({
      authoringType: 'building',
      parent: { kind: 'fixed', locationId: HARBORFORD.id },
    })
  })

  it('overview settlement after setup fixes settlementType but not parent', () => {
    expect(
      completeLocationCreateSetup({ authoringType: 'settlement' }, { settlementType: 'city' }),
    ).toEqual({
      authoringType: 'settlement',
      settlementType: 'city',
    })
  })

  it('contained settlement after setup fixes both settlementType and parent', () => {
    expect(
      completeLocationCreateSetup(
        { authoringType: 'settlement', parentLocationId: HARBORFORD.id },
        { settlementType: 'metropolis' },
      ),
    ).toEqual({
      authoringType: 'settlement',
      parent: { kind: 'fixed', locationId: HARBORFORD.id },
      settlementType: 'metropolis',
    })
  })
})
