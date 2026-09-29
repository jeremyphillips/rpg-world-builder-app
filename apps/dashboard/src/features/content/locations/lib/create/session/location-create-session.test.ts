import { describe, expect, it } from 'vitest'

import { HARBORFORD, DOCK_WARD, ALDERMERE } from '../../../fixtures'
import {
  completeLocationCreateSetup,
  fixedCreateFromIntent,
  resolveLocationCreateSession,
} from './location-create-session'

describe('resolveLocationCreateSession', () => {
  it('returns needsSetup for building', () => {
    expect(resolveLocationCreateSession({ authoringType: 'building' })).toEqual({
      status: 'needsSetup',
    })
  })

  it('returns needsSetup when authoring type is omitted (modal type step)', () => {
    expect(resolveLocationCreateSession({})).toEqual({ status: 'needsSetup' })
  })

  it('returns needsSetup for settlement', () => {
    expect(resolveLocationCreateSession({ authoringType: 'settlement' })).toEqual({
      status: 'needsSetup',
    })
  })

  it('includes fixed parent for contained create intents after setup', () => {
    expect(
      completeLocationCreateSetup(
        { authoringType: 'building', parentLocationId: HARBORFORD.id },
        { kind: 'building' },
      ),
    ).toEqual({
      authoringType: 'building',
      parent: { kind: 'fixed', locationId: HARBORFORD.id },
    })
  })
})

describe('completeLocationCreateSetup', () => {
  it('keeps Building classification out of fixed create context', () => {
    expect(
      completeLocationCreateSetup(
        { authoringType: 'building', parentLocationId: HARBORFORD.id },
        {
          kind: 'building',
          form: 'house',
          facilityAuthoringGroup: 'residential',
        },
      ),
    ).toEqual({
      authoringType: 'building',
      parent: { kind: 'fixed', locationId: HARBORFORD.id },
    })
  })

  it('merges setup result into fixed create context deterministically', () => {
    expect(
      completeLocationCreateSetup(
        { authoringType: 'settlement', parentLocationId: DOCK_WARD.id },
        { kind: 'settlement', settlementType: 'city' },
      ),
    ).toEqual({
      authoringType: 'settlement',
      parent: { kind: 'fixed', locationId: DOCK_WARD.id },
      settlementType: 'city',
    })
  })

  it('derives authoring type from setup result when intent omits it', () => {
    expect(completeLocationCreateSetup({}, { kind: 'site', siteType: 'landmark' })).toEqual({
      authoringType: 'site',
      siteType: 'landmark',
    })
  })

  it('does not require navigation or shell state', () => {
    const result = completeLocationCreateSetup(
      { authoringType: 'settlement' },
      {
        kind: 'settlement',
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
      completeLocationCreateSetup(
        { authoringType: 'settlement' },
        { kind: 'settlement', settlementType: 'city' },
      ),
    ).toEqual({
      authoringType: 'settlement',
      settlementType: 'city',
    })
  })

  it('contained settlement after setup fixes both settlementType and parent', () => {
    expect(
      completeLocationCreateSetup(
        { authoringType: 'settlement', parentLocationId: HARBORFORD.id },
        { kind: 'settlement', settlementType: 'metropolis' },
      ),
    ).toEqual({
      authoringType: 'settlement',
      parent: { kind: 'fixed', locationId: HARBORFORD.id },
      settlementType: 'metropolis',
    })
  })

  it('returns needsSetup for region and site', () => {
    expect(resolveLocationCreateSession({ authoringType: 'region' })).toEqual({
      status: 'needsSetup',
    })
    expect(resolveLocationCreateSession({ authoringType: 'site' })).toEqual({
      status: 'needsSetup',
    })
  })

  it('locks region classification and site type from setup', () => {
    expect(
      completeLocationCreateSetup(
        { authoringType: 'region', parentLocationId: ALDERMERE.id, parentKind: 'world' },
        { kind: 'region', classification: { kind: 'political', type: 'kingdom' } },
      ),
    ).toEqual({
      authoringType: 'region',
      parent: { kind: 'fixed', locationId: ALDERMERE.id },
      parentKind: 'world',
      classification: { kind: 'political', type: 'kingdom' },
    })

    expect(
      completeLocationCreateSetup(
        { authoringType: 'site' },
        { kind: 'site', siteType: 'landmark' },
      ),
    ).toEqual({
      authoringType: 'site',
      siteType: 'landmark',
    })
  })
})
