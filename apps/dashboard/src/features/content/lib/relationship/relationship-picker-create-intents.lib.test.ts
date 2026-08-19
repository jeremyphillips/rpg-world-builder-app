import { describe, expect, it } from 'vitest'

import {
  LOCATION_AUTHORING_TYPE_IDS,
  type LocationAuthoringType,
} from '../../locations/lib/location-authoring-type'
import {
  resolveRelationshipPickerCreateIntents,
  type RelationshipPickerCreateIntent,
} from './relationship-picker-create-intents.lib'

function locationAuthoringTypes(
  intents: readonly RelationshipPickerCreateIntent[],
): LocationAuthoringType[] {
  return intents
    .filter(
      (intent): intent is Extract<RelationshipPickerCreateIntent, { target: 'location' }> =>
        intent.target === 'location',
    )
    .map((intent) => intent.authoringType)
}

describe('resolveRelationshipPickerCreateIntents', () => {
  it('returns one organization create intent for organization target input', () => {
    expect(resolveRelationshipPickerCreateIntents({ target: 'organization' })).toEqual([
      expect.objectContaining({
        target: 'organization',
        id: 'organization',
        label: 'Create organization',
      }),
    ])
  })

  it('returns no location intents when the selected kind has no eligible authoring types', () => {
    expect(
      locationAuthoringTypes(
        resolveRelationshipPickerCreateIntents({
          target: 'location',
          selectedKind: 'operates_in',
          activeBrowseScope: 'settlement',
          parentLocationId: 'parent-1',
        }),
      ).includes('site'),
    ).toBe(false)
  })

  it('returns a direct region intent for controls', () => {
    expect(
      resolveRelationshipPickerCreateIntents({
        target: 'location',
        selectedKind: 'controls',
      }),
    ).toEqual([
      expect.objectContaining({
        target: 'location',
        authoringType: 'region',
        label: 'Create region',
      }),
    ])
  })

  it('returns settlement and region intents for governs', () => {
    const intents = resolveRelationshipPickerCreateIntents({
      target: 'location',
      selectedKind: 'governs',
    })

    expect(intents.map((intent) => intent.id)).toEqual(['region', 'settlement'])
  })

  it('returns headquarters structure intents in LOCATION_AUTHORING_TYPE_IDS order', () => {
    const intents = resolveRelationshipPickerCreateIntents({
      target: 'location',
      selectedKind: 'headquarters',
    })

    expect(locationAuthoringTypes(intents)).toEqual(['building', 'fortification', 'structure'])

    const order = locationAuthoringTypes(intents).map((authoringType) =>
      LOCATION_AUTHORING_TYPE_IDS.indexOf(authoringType),
    )
    expect(order).toEqual([...order].sort((left, right) => left - right))
  })

  it('returns owns/operator structure intents in registry order', () => {
    expect(
      locationAuthoringTypes(
        resolveRelationshipPickerCreateIntents({
          target: 'location',
          selectedKind: 'owns',
        }),
      ),
    ).toEqual(['building', 'fortification', 'infrastructure', 'vessel', 'structure'])
  })

  it('returns only building for tenant without parent context', () => {
    expect(
      locationAuthoringTypes(
        resolveRelationshipPickerCreateIntents({
          target: 'location',
          selectedKind: 'tenant',
        }),
      ),
    ).toEqual(['building'])
  })

  it('omits district and interior without parentLocationId', () => {
    const intents = resolveRelationshipPickerCreateIntents({
      target: 'location',
      selectedKind: 'operates_in',
      activeBrowseScope: 'all',
    })

    expect(locationAuthoringTypes(intents).includes('district')).toBe(false)
    expect(locationAuthoringTypes(intents).includes('interior')).toBe(false)
  })

  it('includes district when parentLocationId is provided and eligible', () => {
    expect(
      locationAuthoringTypes(
        resolveRelationshipPickerCreateIntents({
          target: 'location',
          selectedKind: 'operates_in',
          activeBrowseScope: 'settlement',
          parentLocationId: 'settlement-1',
        }),
      ),
    ).toEqual(['settlement', 'district'])
  })

  it('narrows operates_in All to settlement and region', () => {
    expect(
      locationAuthoringTypes(
        resolveRelationshipPickerCreateIntents({
          target: 'location',
          selectedKind: 'operates_in',
          activeBrowseScope: 'all',
        }),
      ),
    ).toEqual(['region', 'settlement'])
  })

  it('narrows operates_in Settlements scope to settlement only', () => {
    expect(
      locationAuthoringTypes(
        resolveRelationshipPickerCreateIntents({
          target: 'location',
          selectedKind: 'operates_in',
          activeBrowseScope: 'settlement',
        }),
      ),
    ).toEqual(['settlement'])
  })

  it('narrows operates_in Regions scope to region only', () => {
    expect(
      locationAuthoringTypes(
        resolveRelationshipPickerCreateIntents({
          target: 'location',
          selectedKind: 'operates_in',
          activeBrowseScope: 'region',
        }),
      ),
    ).toEqual(['region'])
  })
})
