import { describe, expect, it, vi } from 'vitest'
import type { Location } from '@rpg/contracts'

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
import {
  buildLocationChildren,
  buildLocationLocatedInSegments,
  buildLocationsById,
  LOCATION_UNKNOWN_ANCESTOR_LABEL,
} from './location-display'

vi.mock('../../lib/list/content-client', () => ({
  updateContent: vi.fn(),
}))

import { updateContent } from '../../lib/list/content-client'

const mockUpdateContent = vi.mocked(updateContent)

const CAMPAIGN_ID = 'camp_1'

describe('resolveLocationParentReplacementAction', () => {
  it('returns null for plane locations and non-managers', () => {
    const plane: Location = { ...ALDERMERE, id: 'plane-1', kind: 'plane' }

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
      }),
    ).toBeNull()
  })

  it('builds a resolvable current parent snapshot from parentLocationId', () => {
    expect(
      resolveLocationParentReplacementCurrentSnapshot({
        subject: YAWNING_PORTAL,
        locationsById: buildLocationsById(LOCATIONS_LIST),
      }),
    ).toEqual({
      parentLocationId: DOCK_WARD.id,
      heading: DOCK_WARD.name,
      subheading: 'District',
    })
  })

  it('marks stale parent ids unavailable while still returning the persisted id', () => {
    const staleParent: Location = {
      ...YAWNING_PORTAL,
      parentLocationId: 'missing-parent-id',
    }

    expect(
      resolveLocationParentReplacementCurrentSnapshot({
        subject: staleParent,
        locationsById: buildLocationsById(LOCATIONS_LIST),
      }),
    ).toEqual({
      parentLocationId: 'missing-parent-id',
      heading: LOCATION_UNKNOWN_ANCESTOR_LABEL,
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
    const plane: Location = {
      ...ALDERMERE,
      id: 'location-plane',
      slug: 'plane',
      name: 'Material Plane',
      kind: 'plane',
    }
    const parentlessWorld: Location = { ...ALDERMERE, parentLocationId: undefined }
    const candidates = buildEligibleLocationParentReplacementCandidates({
      subject: parentlessWorld,
      campaignLocations: [...LOCATIONS_LIST, plane],
    })

    expect(candidates.map((location) => location.id)).toEqual([plane.id])
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
    })

    expect(context.mode).toBe('change')
    expect(context.currentParent?.parentLocationId).toBe(DOCK_WARD.id)
    expect(context.candidates.map((location) => location.id)).toEqual([HARBORFORD.id])
  })
})

describe('location hierarchy projections after parentLocationId changes', () => {
  it('updates located-in and contained-location projections from one canonical store', () => {
    const movedChild: Location = {
      ...YAWNING_PORTAL,
      parentLocationId: HARBORFORD.id,
    }
    const updatedLocations = LOCATIONS_LIST.map((location) =>
      location.id === YAWNING_PORTAL.id ? movedChild : location,
    )
    const locationsById = buildLocationsById(updatedLocations)

    expect(
      buildLocationLocatedInSegments(movedChild, locationsById, CAMPAIGN_ID).map(
        (segment) => segment.name,
      ),
    ).toEqual(['Aldermere', 'Greyshore', 'Harborford'])
    expect(buildLocationChildren(DOCK_WARD.id, updatedLocations, CAMPAIGN_ID)).toEqual([])
    expect(
      buildLocationChildren(HARBORFORD.id, updatedLocations, CAMPAIGN_ID).map(
        (child) => child.name,
      ),
    ).toEqual(['Dock Ward', 'Yawning Portal'])
  })
})

describe('applyLocationParentReplacement', () => {
  it('patches only the subject parentLocationId', async () => {
    mockUpdateContent.mockResolvedValue(YAWNING_PORTAL)

    await applyLocationParentReplacement({
      campaignId: CAMPAIGN_ID,
      subjectId: YAWNING_PORTAL.id,
      newParentLocationId: HARBORFORD.id,
    })

    expect(mockUpdateContent).toHaveBeenCalledWith(CAMPAIGN_ID, 'locations', YAWNING_PORTAL.id, {
      parentLocationId: HARBORFORD.id,
    })
  })
})

describe('invalidateLocationParentReplacementQueries', () => {
  it('invalidates the campaign locations list query key', () => {
    const queryClient = makeTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateLocationParentReplacementQueries(queryClient, CAMPAIGN_ID)

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['campaigns', CAMPAIGN_ID, 'content', 'locations'],
    })
  })
})

describe('resolveLocationParentReplacementMode', () => {
  it('maps parent presence to drawer mode', () => {
    expect(resolveLocationParentReplacementMode(YAWNING_PORTAL)).toBe('change')
    expect(resolveLocationParentReplacementMode(ALDERMERE)).toBe('set')
  })
})
