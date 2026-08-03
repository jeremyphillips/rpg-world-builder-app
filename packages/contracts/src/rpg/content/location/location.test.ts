import { describe, expect, it } from 'vitest'

import {
  createLocationDraftInputSchema,
  createLocationInputSchema,
  locationBodyDraftSchema,
  locationBodySchema,
  locationDraftStoredSchema,
  locationSchema,
  updateLocationDraftInputSchema,
  updateLocationInputSchema,
} from './location'

const timestamps = {
  createdAt: '2026-07-28T12:00:00.000Z',
  updatedAt: '2026-07-28T12:00:00.000Z',
}

describe('location body contracts', () => {
  it('parses publish-complete bodies for each kind', () => {
    expect(
      locationBodySchema.parse({
        kind: 'settlement',
        name: 'Waterdeep',
        settlementType: 'metropolis',
        parentLocationId: 'region-sword-coast',
      }),
    ).toMatchObject({
      kind: 'settlement',
      settlementType: 'metropolis',
      parentLocationId: 'region-sword-coast',
    })

    expect(
      locationBodySchema.parse({
        kind: 'plane',
        name: 'Material Plane',
      }),
    ).toMatchObject({
      kind: 'plane',
      name: 'Material Plane',
    })
  })

  it('allows drafts without subtypes or parent and normalizes blank names', () => {
    expect(locationBodyDraftSchema.parse({ kind: 'site', name: '  ' })).toEqual({
      kind: 'site',
      name: 'Untitled Location',
    })
  })

  it('rejects subtype values outside closed vocabularies', () => {
    expect(
      locationBodySchema.safeParse({
        kind: 'settlement',
        name: 'Test',
        settlementType: 'other',
      }).success,
    ).toBe(false)
  })
})

describe('location stored contracts', () => {
  const meta = {
    id: 'location-1',
    slug: 'waterdeep',
    rulesetId: 'srd-cc-5.2.1',
    source: 'homebrew' as const,
    campaignId: 'campaign-1',
    ...timestamps,
  }

  it('parses published and draft records with their respective completeness rules', () => {
    const parsed = locationSchema.parse({
      ...meta,
      status: 'published',
      kind: 'settlement',
      name: 'Waterdeep',
      settlementType: 'metropolis',
      parentLocationId: 'region-sword-coast',
    })
    expect(parsed.kind === 'settlement' ? parsed.settlementType : undefined).toBe('metropolis')

    expect(
      locationDraftStoredSchema.parse({
        ...meta,
        status: 'draft',
        kind: 'district',
        name: '',
      }),
    ).toMatchObject({
      name: 'Untitled Location',
      status: 'draft',
      kind: 'district',
    })
  })
})

describe('location authoring inputs', () => {
  it('requires kind for publish and draft create inputs', () => {
    expect(
      createLocationInputSchema.safeParse({
        slug: 'waterdeep',
        name: 'Waterdeep',
      }).success,
    ).toBe(false)

    expect(
      createLocationInputSchema.safeParse({
        slug: 'waterdeep',
        kind: 'settlement',
        name: 'Waterdeep',
        parentLocationId: 'region-sword-coast',
      }).success,
    ).toBe(true)

    expect(
      createLocationDraftInputSchema.parse({
        slug: 'untitled-location',
        kind: 'world',
        name: '',
      }).name,
    ).toBe('Untitled Location')
  })

  it('supports partial publish and draft updates per kind', () => {
    expect(
      updateLocationInputSchema.parse({
        kind: 'region',
        regionType: 'coast',
      }),
    ).toEqual({
      kind: 'region',
      regionType: 'coast',
    })

    expect(
      updateLocationDraftInputSchema.parse({ kind: 'site', description: '<p>Notes</p>' }),
    ).toEqual({
      kind: 'site',
      description: '<p>Notes</p>',
    })
  })
})
