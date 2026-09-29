import { describe, expect, it } from 'vitest'

import {
  buildLocationCreateInitialValues,
  buildLocationCreatePrefillHref,
  buildLocationFixedCreateHref,
  childAuthoringTypesForParentKind,
  formatLocationAuthoringTypeAddHeading,
  formatLocationFixedCreateHeading,
  LOCATION_CREATE_PARENT_SEARCH_PARAM,
  LOCATION_CREATE_SETTLEMENT_TYPE_SEARCH_PARAM,
  LOCATION_CREATE_TYPE_SEARCH_PARAM,
  parseLocationCreatePrefillFromSearchParams,
  parseLocationCreateSoftParent,
} from './location-create-shortcuts'

describe('parseLocationCreatePrefillFromSearchParams', () => {
  it('returns empty prefill when type param is absent', () => {
    expect(parseLocationCreatePrefillFromSearchParams(new URLSearchParams())).toEqual({})
  })

  it('prefills authoring type without a setup gate', () => {
    expect(
      parseLocationCreatePrefillFromSearchParams(
        new URLSearchParams(`${LOCATION_CREATE_TYPE_SEARCH_PARAM}=settlement`),
      ),
    ).toEqual({ authoringType: 'settlement' })
  })

  it('includes setup fields when present on the URL', () => {
    const params = new URLSearchParams(
      `${LOCATION_CREATE_TYPE_SEARCH_PARAM}=settlement&${LOCATION_CREATE_SETTLEMENT_TYPE_SEARCH_PARAM}=city`,
    )

    expect(parseLocationCreatePrefillFromSearchParams(params)).toEqual({
      authoringType: 'settlement',
      settlementType: 'city',
    })
  })

  it('ignores unknown type params safely', () => {
    expect(
      parseLocationCreatePrefillFromSearchParams(
        new URLSearchParams(`${LOCATION_CREATE_TYPE_SEARCH_PARAM}=inn`),
      ),
    ).toEqual({})
  })

  it('round-trips prefill through buildLocationCreatePrefillHref', () => {
    const href = buildLocationCreatePrefillHref('campaign-1', {
      authoringType: 'building',
      buildingForm: 'tower',
      facilityGroup: 'production',
    })
    const parsed = parseLocationCreatePrefillFromSearchParams(
      new URLSearchParams(href.split('?')[1]),
    )

    expect(parsed).toEqual({
      authoringType: 'building',
      buildingForm: 'tower',
      facilityGroup: 'production',
    })
  })

  it('round-trips fixed create href helpers', () => {
    const href = buildLocationFixedCreateHref('campaign-1', {
      authoringType: 'site',
      siteType: 'ruin',
    })
    expect(
      parseLocationCreatePrefillFromSearchParams(new URLSearchParams(href.split('?')[1])),
    ).toEqual({
      authoringType: 'site',
      siteType: 'ruin',
    })
  })
})

describe('parseLocationCreateSoftParent', () => {
  it('reads soft parent prefill independently of fixed session authority', () => {
    expect(
      parseLocationCreateSoftParent(
        new URLSearchParams(
          `${LOCATION_CREATE_TYPE_SEARCH_PARAM}=building&${LOCATION_CREATE_PARENT_SEARCH_PARAM}=location-parent`,
        ),
      ),
    ).toBe('location-parent')
  })
})

describe('buildLocationCreateInitialValues', () => {
  it('prefers explicit parent prefill over campaign defaults', () => {
    expect(
      buildLocationCreateInitialValues(
        { authoringType: 'site', parentLocationId: 'location-harborford' },
        { parentLocationId: 'location-aldermere' },
      ),
    ).toEqual({
      authoringType: 'site',
      parentLocationId: 'location-harborford',
    })
  })

  it('falls back to campaign default parent when prefill omits parent', () => {
    expect(
      buildLocationCreateInitialValues(
        { authoringType: 'building' },
        { parentLocationId: 'location-aldermere' },
      ),
    ).toEqual({
      authoringType: 'building',
      parentLocationId: 'location-aldermere',
    })
  })

  it('includes fixed settlement type in initial values', () => {
    expect(
      buildLocationCreateInitialValues({
        authoringType: 'settlement',
        settlementType: 'city',
      }),
    ).toEqual({
      authoringType: 'settlement',
      settlementType: 'city',
    })
  })
})

describe('formatLocationAuthoringTypeAddHeading', () => {
  it('formats add headings with mid-sentence labels', () => {
    expect(formatLocationAuthoringTypeAddHeading('building')).toBe('Add building')
    expect(formatLocationAuthoringTypeAddHeading('district')).toBe('Add district')
    expect(formatLocationAuthoringTypeAddHeading('structure')).toBe('Add unclassified structure')
  })

  it('uses Subregion when parent kind is region', () => {
    expect(formatLocationAuthoringTypeAddHeading('region')).toBe('Add region')
    expect(formatLocationAuthoringTypeAddHeading('region', { parentKind: 'world' })).toBe(
      'Add region',
    )
    expect(formatLocationAuthoringTypeAddHeading('region', { parentKind: 'region' })).toBe(
      'Add subregion',
    )
  })
})

describe('formatLocationFixedCreateHeading', () => {
  it('uses Create-prefix settlement and site type labels', () => {
    expect(
      formatLocationFixedCreateHeading({
        authoringType: 'settlement',
        settlementType: 'city',
      }),
    ).toBe('Create city')
    expect(
      formatLocationFixedCreateHeading({
        authoringType: 'site',
        siteType: 'landmark',
      }),
    ).toBe('Create landmark')
  })

  it('uses region type labels for fixed region create', () => {
    expect(
      formatLocationFixedCreateHeading({
        authoringType: 'region',
        classification: { kind: 'political', type: 'duchy' },
      }),
    ).toBe('Create duchy')
  })

  it('falls back to authoring type labels', () => {
    expect(
      formatLocationFixedCreateHeading({
        authoringType: 'building',
        parent: { kind: 'fixed', locationId: 'location-parent' },
      }),
    ).toBe('Create building')
  })
})

describe('buildLocationFixedCreateHref', () => {
  it('builds fixed settlement links with settlementType', () => {
    expect(
      buildLocationFixedCreateHref('campaign-1', {
        authoringType: 'settlement',
        settlementType: 'city',
      }),
    ).toBe('/campaigns/campaign-1/locations/new?type=settlement&settlementType=city')
  })

  it('builds fixed create links with type and soft parent query params', () => {
    expect(
      buildLocationFixedCreateHref(
        'campaign-1',
        { authoringType: 'settlement' },
        'location-greyshore',
      ),
    ).toBe('/campaigns/campaign-1/locations/new?type=settlement&parent=location-greyshore')
  })
})

describe('childAuthoringTypesForParentKind', () => {
  it('derives child authoring types from contracts hierarchy for settlements', () => {
    expect(childAuthoringTypesForParentKind('settlement')).toEqual([
      'building',
      'site',
      'district',
      'fortification',
      'infrastructure',
      'monument',
      'vessel',
      'structure',
    ])
  })

  it('does not allow districts to parent other districts', () => {
    expect(childAuthoringTypesForParentKind('district')).not.toContain('district')
    expect(childAuthoringTypesForParentKind('district')).toEqual(
      expect.arrayContaining(['building', 'site', 'structure']),
    )
  })

  it('offers structure authoring types under site and structure parents', () => {
    expect(childAuthoringTypesForParentKind('site')).toEqual(
      expect.arrayContaining(['building', 'fortification', 'structure']),
    )
    expect(childAuthoringTypesForParentKind('structure')).toEqual(
      expect.arrayContaining(['building', 'fortification', 'structure']),
    )
    expect(childAuthoringTypesForParentKind('site')).not.toContain('interior')
  })
})
