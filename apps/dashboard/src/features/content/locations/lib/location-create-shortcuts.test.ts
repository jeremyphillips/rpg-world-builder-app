import { describe, expect, it } from 'vitest'

import {
  buildLocationCreateInitialValues,
  buildLocationFixedCreateHref,
  childAuthoringTypesForParentKind,
  formatLocationAuthoringTypeAddHeading,
  formatLocationFixedCreateAddHeading,
  formatLocationFixedCreateHeading,
  LOCATION_CREATE_PARENT_SEARCH_PARAM,
  LOCATION_CREATE_PROMOTED_AUTHORING_TYPES,
  LOCATION_CREATE_SETTLEMENT_TYPE_SEARCH_PARAM,
  LOCATION_CREATE_TYPE_SEARCH_PARAM,
  parseLocationCreateSessionFromSearchParams,
  parseLocationCreateSoftParent,
} from './location-create-shortcuts'
import { completeLocationCreateSetup, fixedCreateFromIntent } from './location-create-session'

describe('parseLocationCreateSessionFromSearchParams', () => {
  it('returns unrestricted when type param is absent', () => {
    expect(parseLocationCreateSessionFromSearchParams(new URLSearchParams())).toEqual({
      kind: 'unrestricted',
    })
  })

  it('returns ready fixed building session for valid type param', () => {
    const params = new URLSearchParams(`${LOCATION_CREATE_TYPE_SEARCH_PARAM}=building`)
    const intent = { authoringType: 'building' as const }

    expect(parseLocationCreateSessionFromSearchParams(params)).toEqual({
      kind: 'ready',
      fixedCreate: fixedCreateFromIntent(intent),
    })
  })

  it('returns needsSetup for settlement without settlementType', () => {
    expect(
      parseLocationCreateSessionFromSearchParams(
        new URLSearchParams(`${LOCATION_CREATE_TYPE_SEARCH_PARAM}=settlement`),
      ),
    ).toEqual({
      kind: 'needsSetup',
      intent: { authoringType: 'settlement' },
    })
  })

  it('returns ready fixed settlement session when settlementType is present', () => {
    const params = new URLSearchParams(
      `${LOCATION_CREATE_TYPE_SEARCH_PARAM}=settlement&${LOCATION_CREATE_SETTLEMENT_TYPE_SEARCH_PARAM}=city`,
    )
    const intent = { authoringType: 'settlement' as const }

    expect(parseLocationCreateSessionFromSearchParams(params)).toEqual({
      kind: 'ready',
      fixedCreate: completeLocationCreateSetup(intent, {
        kind: 'settlement',
        settlementType: 'city',
      }),
    })
  })

  it('returns needsSetup for region and site without setup params', () => {
    expect(
      parseLocationCreateSessionFromSearchParams(
        new URLSearchParams(`${LOCATION_CREATE_TYPE_SEARCH_PARAM}=region`),
      ),
    ).toEqual({
      kind: 'needsSetup',
      intent: { authoringType: 'region' },
    })
    expect(
      parseLocationCreateSessionFromSearchParams(
        new URLSearchParams(`${LOCATION_CREATE_TYPE_SEARCH_PARAM}=site`),
      ),
    ).toEqual({
      kind: 'needsSetup',
      intent: { authoringType: 'site' },
    })
  })

  it('ignores unknown type params safely', () => {
    expect(
      parseLocationCreateSessionFromSearchParams(
        new URLSearchParams(`${LOCATION_CREATE_TYPE_SEARCH_PARAM}=inn`),
      ),
    ).toEqual({ kind: 'unrestricted' })
  })

  it('round-trips fixed sessions through buildLocationFixedCreateHref', () => {
    const href = buildLocationFixedCreateHref('campaign-1', {
      authoringType: 'settlement',
      settlementType: 'town',
    })
    const parsed = parseLocationCreateSessionFromSearchParams(
      new URLSearchParams(href.split('?')[1]),
    )

    expect(parsed).toEqual({
      kind: 'ready',
      fixedCreate: completeLocationCreateSetup(
        { authoringType: 'settlement' },
        { kind: 'settlement', settlementType: 'town' },
      ),
    })
  })

  it('round-trips site and region setup params', () => {
    const siteHref = buildLocationFixedCreateHref('campaign-1', {
      authoringType: 'site',
      siteType: 'ruin',
    })
    expect(
      parseLocationCreateSessionFromSearchParams(new URLSearchParams(siteHref.split('?')[1])),
    ).toEqual({
      kind: 'ready',
      fixedCreate: completeLocationCreateSetup(
        { authoringType: 'site' },
        { kind: 'site', siteType: 'ruin' },
      ),
    })

    const regionHref = buildLocationFixedCreateHref('campaign-1', {
      authoringType: 'region',
      classification: { kind: 'geographic', type: 'coast' },
    })
    expect(
      parseLocationCreateSessionFromSearchParams(new URLSearchParams(regionHref.split('?')[1])),
    ).toEqual({
      kind: 'ready',
      fixedCreate: completeLocationCreateSetup(
        { authoringType: 'region' },
        { kind: 'region', classification: { kind: 'geographic', type: 'coast' } },
      ),
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

describe('formatLocationFixedCreateAddHeading', () => {
  it('uses settlement type labels for fixed settlement create', () => {
    expect(
      formatLocationFixedCreateAddHeading({
        authoringType: 'settlement',
        settlementType: 'city',
      }),
    ).toBe('Add city')
  })

  it('falls back to authoring type labels for non-settlement fixed create', () => {
    expect(
      formatLocationFixedCreateAddHeading({
        authoringType: 'building',
        parent: { kind: 'fixed', locationId: 'location-parent' },
      }),
    ).toBe('Add building')
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

  it('lists promoted overview shortcuts from the registry ids', () => {
    expect(LOCATION_CREATE_PROMOTED_AUTHORING_TYPES).toEqual([
      'building',
      'settlement',
      'site',
      'region',
    ])
  })
})
