import { describe, expect, it } from 'vitest'

import { makeLocation } from '@/test/fixtures/factories/location'

import {
  createResidenceLocationConnection,
  filterResidenceEligibleLocations,
  getResidenceConnections,
  isResidenceEligibleLocation,
} from './residence-location-connection.lib'

describe('residence-location-connection.lib', () => {
  it('treats settlements and districts as residence-eligible', () => {
    const settlement = makeLocation({ kind: 'settlement', slug: 'harborford', name: 'Harborford' })
    const region = makeLocation({ kind: 'region', slug: 'greyshore', name: 'Greyshore' })

    expect(isResidenceEligibleLocation(settlement)).toBe(true)
    expect(isResidenceEligibleLocation(region)).toBe(false)
    expect(filterResidenceEligibleLocations([settlement, region])).toEqual([settlement])
  })

  it('creates resides_at connections with ids', () => {
    const connection = createResidenceLocationConnection('location-harborford')

    expect(connection).toEqual({
      id: expect.any(String),
      locationId: 'location-harborford',
      kind: 'resides_at',
    })
  })

  it('filters residence connections from mixed location connections', () => {
    const residence = createResidenceLocationConnection('location-harborford')
    const other = { id: 'conn-2', locationId: 'location-shop', kind: 'works_at' as const }

    expect(getResidenceConnections([residence, other])).toEqual([residence])
  })
})
