import { describe, expect, it } from 'vitest'

import {
  buildLocationCreateHref,
  buildLocationCreateInitialValues,
  childAuthoringTypesForParentKind,
  formatLocationAuthoringTypeAddHeading,
  LOCATION_CREATE_PARENT_SEARCH_PARAM,
  LOCATION_CREATE_PROMOTED_AUTHORING_TYPES,
  LOCATION_CREATE_TYPE_SEARCH_PARAM,
  parseLocationCreatePrefill,
} from './location-create-shortcuts'

describe('parseLocationCreatePrefill', () => {
  it('accepts valid authoring types and parent ids', () => {
    expect(
      parseLocationCreatePrefill(
        new URLSearchParams(
          `${LOCATION_CREATE_TYPE_SEARCH_PARAM}=building&${LOCATION_CREATE_PARENT_SEARCH_PARAM}=location-dock-ward`,
        ),
      ),
    ).toEqual({
      authoringType: 'building',
      parentLocationId: 'location-dock-ward',
    })
  })

  it('ignores unknown or stale authoring types without error', () => {
    expect(
      parseLocationCreatePrefill(
        new URLSearchParams(
          `${LOCATION_CREATE_TYPE_SEARCH_PARAM}=inn&${LOCATION_CREATE_TYPE_SEARCH_PARAM}=building`,
        ),
      ),
    ).toEqual({})
  })

  it('ignores empty type values', () => {
    expect(
      parseLocationCreatePrefill(new URLSearchParams(`${LOCATION_CREATE_TYPE_SEARCH_PARAM}=`)),
    ).toEqual({})
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
})

describe('formatLocationAuthoringTypeAddHeading', () => {
  it('formats add headings with mid-sentence labels', () => {
    expect(formatLocationAuthoringTypeAddHeading('building')).toBe('Add building')
    expect(formatLocationAuthoringTypeAddHeading('district')).toBe('Add district')
    expect(formatLocationAuthoringTypeAddHeading('structure')).toBe('Add unclassified structure')
  })
})

describe('buildLocationCreateHref', () => {
  it('builds create links with type and parent query params', () => {
    expect(
      buildLocationCreateHref('campaign-1', {
        authoringType: 'settlement',
        parentLocationId: 'location-greyshore',
      }),
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

  it('lists promoted overview shortcuts from the registry ids', () => {
    expect(LOCATION_CREATE_PROMOTED_AUTHORING_TYPES).toEqual([
      'building',
      'settlement',
      'site',
      'region',
    ])
  })
})
