import { describe, expect, it, vi } from 'vitest'

import { STORY_CAMPAIGN_ID } from '@/test/fixtures/constants'
import { makeLocation } from '@/test/fixtures/factories/location'
import { makeTestQueryClient } from '@/test/render'

import {
  ALDERMERE,
  DOCK_WARD,
  GREYSHORE,
  HARBORFORD,
  LOCATIONS_LIST,
  YAWNING_PORTAL,
} from '../fixtures'
import {
  applyLocationParentReplacement,
  buildEligibleLocationParentReplacementCandidates,
  buildLocationParentReplacementContext,
  canSubmitLocationParentReplacement,
  hasLocationParentReplacementContextMismatch,
  invalidateLocationParentReplacementQueries,
  resolveLocationParentReplacementAction,
  resolveLocationParentReplacementCurrentSnapshot,
  resolveLocationParentReplacementMode,
} from './location-parent-replacement'
import { ENTITY_REPLACEMENT_UNAVAILABLE_LOCATION_HEADING } from '../../lib/entity-replacement/entity-replacement-current-entity'
import {
  buildLocationChildren,
  buildLocationLocatedInSegments,
  buildLocationsById,
} from './location-display'

vi.mock('../../lib/list/content-client', () => ({
  updateContent: vi.fn(),
}))

import { updateContent } from '../../lib/list/content-client'

const mockUpdateContent = vi.mocked(updateContent)

describe('resolveLocationParentReplacementAction', () => {
  it('returns null for plane locations and non-managers', () => {
    const plane = makeLocation({ kind: 'plane', id: 'plane-1' })

    expect(
      resolveLocationParentReplacementAction({
        subject: plane,
        canManage: true,
      }),
    ).toBeNull()
    expect(
      resolveLocationParentReplacementAction({
        subject: YAWNING_PORTAL,
        canManage: false,
      }),
    ).toBeNull()
  })

  it('returns changeParent when a parent is assigned and setParent when parentless', () => {
    expect(
      resolveLocationParentReplacementAction({
        subject: YAWNING_PORTAL,
        canManage: true,
      }),
    ).toBe('changeParent')
    expect(
      resolveLocationParentReplacementAction({
        subject: { ...ALDERMERE, parentLocationId: undefined },
        canManage: true,
      }),
    ).toBe('setParent')
  })
})

describe('resolveLocationParentReplacementCurrentSnapshot', () => {
  it('returns null when the subject has no parent', () => {
    expect(
      resolveLocationParentReplacementCurrentSnapshot({
        subject: ALDERMERE,
        locationsById: buildLocationsById(LOCATIONS_LIST),
        campaignId: STORY_CAMPAIGN_ID,
      }),
    ).toBeNull()
  })

  it('builds a resolvable current parent snapshot from parentLocationId', () => {
    expect(
      resolveLocationParentReplacementCurrentSnapshot({
        subject: YAWNING_PORTAL,
        locationsById: buildLocationsById(LOCATIONS_LIST),
        campaignId: STORY_CAMPAIGN_ID,
      }),
    ).toEqual({
      parentLocationId: DOCK_WARD.id,
      entity: {
        heading: DOCK_WARD.name,
        headingSuffix: ' · District',
        supportingText: 'Located in Harborford',
      },
    })
  })

  it('marks stale parent ids unavailable while still returning the persisted id', () => {
    const staleParent = makeLocation({
      kind: 'structure',
      id: YAWNING_PORTAL.id,
      slug: YAWNING_PORTAL.slug,
      name: YAWNING_PORTAL.name,
      structureType: 'building',
      parentLocationId: 'missing-parent-id',
    })

    expect(
      resolveLocationParentReplacementCurrentSnapshot({
        subject: staleParent,
        locationsById: buildLocationsById(LOCATIONS_LIST),
        campaignId: STORY_CAMPAIGN_ID,
      }),
    ).toEqual({
      parentLocationId: 'missing-parent-id',
      entity: { heading: ENTITY_REPLACEMENT_UNAVAILABLE_LOCATION_HEADING },
      unavailable: true,
    })
  })
})

describe('buildEligibleLocationParentReplacementCandidates', () => {
  it('excludes self, the current parent, invalid kinds, and descendants', () => {
    const candidates = buildEligibleLocationParentReplacementCandidates({
      subject: YAWNING_PORTAL,
      campaignLocations: LOCATIONS_LIST,
    })

    expect(candidates.map((location) => location.id)).toEqual([HARBORFORD.id])
    expect(candidates.some((location) => location.id === YAWNING_PORTAL.id)).toBe(false)
    expect(candidates.some((location) => location.id === DOCK_WARD.id)).toBe(false)
    expect(candidates.some((location) => location.id === GREYSHORE.id)).toBe(false)
  })

  it('includes valid parents for a parentless optional kind', () => {
    const plane = makeLocation({
      kind: 'plane',
      id: 'location-plane',
      slug: 'plane',
      name: 'Material Plane',
    })
    const parentlessWorld = makeLocation({
      kind: 'world',
      id: ALDERMERE.id,
      slug: ALDERMERE.slug,
      name: ALDERMERE.name,
      parentLocationId: undefined,
    })
    const candidates = buildEligibleLocationParentReplacementCandidates({
      subject: parentlessWorld,
      campaignLocations: [...LOCATIONS_LIST, plane],
    })

    expect(candidates.map((location) => location.id)).toEqual([plane.id])
  })

  it('excludes draft locations from new parent selection', () => {
    const draftParent = makeLocation({
      kind: 'region',
      id: 'location-draft-parent',
      slug: 'draft-parent',
      name: 'Draft Parent',
      status: 'draft',
      parentLocationId: ALDERMERE.id,
    })

    const candidates = buildEligibleLocationParentReplacementCandidates({
      subject: YAWNING_PORTAL,
      campaignLocations: [...LOCATIONS_LIST, draftParent],
    })

    expect(candidates.some((location) => location.id === draftParent.id)).toBe(false)
  })

  it('excludes descendants that would create a hierarchy cycle', () => {
    const candidates = buildEligibleLocationParentReplacementCandidates({
      subject: HARBORFORD,
      campaignLocations: LOCATIONS_LIST,
    })

    expect(candidates.map((location) => location.id)).toEqual([ALDERMERE.id])
    expect(candidates.some((location) => location.id === GREYSHORE.id)).toBe(false)
    expect(candidates.some((location) => location.id === DOCK_WARD.id)).toBe(false)
    expect(candidates.some((location) => location.id === YAWNING_PORTAL.id)).toBe(false)
  })

  it('excludes district parents for a district subject', () => {
    const park = makeLocation({
      kind: 'district',
      id: 'location-park',
      slug: 'park',
      name: 'Park',
      parentLocationId: HARBORFORD.id,
    })
    const tenderloin = makeLocation({
      kind: 'district',
      id: 'location-tenderloin',
      slug: 'tenderloin',
      name: 'Tenderloin',
      parentLocationId: park.id,
    })
    const campaignLocations = [...LOCATIONS_LIST, park, tenderloin]

    const candidates = buildEligibleLocationParentReplacementCandidates({
      subject: tenderloin,
      campaignLocations,
    })

    expect(candidates.map((location) => location.id)).toEqual([HARBORFORD.id])
    expect(candidates.some((location) => location.id === park.id)).toBe(false)
  })
})

describe('hasLocationParentReplacementContextMismatch', () => {
  it('detects when the open parent detail does not match the child persisted parent', () => {
    expect(
      hasLocationParentReplacementContextMismatch({
        subject: YAWNING_PORTAL,
        expectedParentLocationId: DOCK_WARD.id,
      }),
    ).toBe(false)
    expect(
      hasLocationParentReplacementContextMismatch({
        subject: YAWNING_PORTAL,
        expectedParentLocationId: HARBORFORD.id,
      }),
    ).toBe(true)
    expect(
      hasLocationParentReplacementContextMismatch({
        subject: { ...ALDERMERE, parentLocationId: undefined },
        expectedParentLocationId: GREYSHORE.id,
      }),
    ).toBe(true)
  })
})

describe('canSubmitLocationParentReplacement', () => {
  it('requires a different parent for change mode and any valid parent for set mode', () => {
    expect(
      canSubmitLocationParentReplacement({
        mode: 'change',
        subject: YAWNING_PORTAL,
        selectedParentId: DOCK_WARD.id,
      }),
    ).toBe(false)
    expect(
      canSubmitLocationParentReplacement({
        mode: 'change',
        subject: YAWNING_PORTAL,
        selectedParentId: HARBORFORD.id,
      }),
    ).toBe(true)
    expect(
      canSubmitLocationParentReplacement({
        mode: 'set',
        subject: { ...ALDERMERE, parentLocationId: undefined },
        selectedParentId: null,
      }),
    ).toBe(false)
    expect(
      canSubmitLocationParentReplacement({
        mode: 'set',
        subject: { ...ALDERMERE, parentLocationId: undefined },
        selectedParentId: ALDERMERE.id,
      }),
    ).toBe(true)
  })
})

describe('buildLocationParentReplacementContext', () => {
  it('derives mode, current parent, and candidates from the canonical parentLocationId', () => {
    const context = buildLocationParentReplacementContext({
      subject: YAWNING_PORTAL,
      campaignLocations: LOCATIONS_LIST,
      campaignId: STORY_CAMPAIGN_ID,
    })

    expect(context.mode).toBe('change')
    expect(context.currentParent?.parentLocationId).toBe(DOCK_WARD.id)
    expect(context.candidates.map((location) => location.id)).toEqual([HARBORFORD.id])
  })
})

describe('location hierarchy projections after parentLocationId changes', () => {
  it('updates located-in and contained-location projections from one canonical store', () => {
    const movedChild = makeLocation({
      kind: 'structure',
      id: YAWNING_PORTAL.id,
      slug: YAWNING_PORTAL.slug,
      name: YAWNING_PORTAL.name,
      structureType: 'building',
      parentLocationId: HARBORFORD.id,
    })
    const updatedLocations = LOCATIONS_LIST.map((location) =>
      location.id === YAWNING_PORTAL.id ? movedChild : location,
    )
    const locationsById = buildLocationsById(updatedLocations)

    expect(
      buildLocationLocatedInSegments(movedChild, locationsById, STORY_CAMPAIGN_ID).map(
        (segment) => segment.name,
      ),
    ).toEqual(['Aldermere', 'Greyshore', 'Harborford'])
    expect(buildLocationChildren(DOCK_WARD.id, updatedLocations, STORY_CAMPAIGN_ID)).toEqual([])
    expect(
      buildLocationChildren(HARBORFORD.id, updatedLocations, STORY_CAMPAIGN_ID).map(
        (child) => child.name,
      ),
    ).toEqual(['Dock Ward', 'Yawning Portal'])
  })
})

describe('applyLocationParentReplacement', () => {
  it('patches only the subject parentLocationId', async () => {
    mockUpdateContent.mockResolvedValue(YAWNING_PORTAL)

    await applyLocationParentReplacement({
      campaignId: STORY_CAMPAIGN_ID,
      subjectId: YAWNING_PORTAL.id,
      subjectKind: YAWNING_PORTAL.kind,
      newParentLocationId: HARBORFORD.id,
    })

    expect(mockUpdateContent).toHaveBeenCalledWith(
      STORY_CAMPAIGN_ID,
      'locations',
      YAWNING_PORTAL.id,
      {
        kind: 'structure',
        parentLocationId: HARBORFORD.id,
      },
    )
  })
})

describe('invalidateLocationParentReplacementQueries', () => {
  it('invalidates the campaign locations list query key', () => {
    const queryClient = makeTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateLocationParentReplacementQueries(queryClient, STORY_CAMPAIGN_ID)

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['campaigns', STORY_CAMPAIGN_ID, 'content', 'locations'],
    })
  })
})

describe('resolveLocationParentReplacementMode', () => {
  it('maps parent presence to drawer mode', () => {
    expect(resolveLocationParentReplacementMode(YAWNING_PORTAL)).toBe('change')
    expect(resolveLocationParentReplacementMode(ALDERMERE)).toBe('set')
  })
})
