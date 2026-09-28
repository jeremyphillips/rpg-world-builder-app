import {
  createUploadRoleAssignment,
  focalPointFromCropCenter,
  resolveAvailableContentMediaSources,
  roleAssignmentUploadImageId,
  type ContentMedia,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'
import { mediaFixture, mediaFixtureAssets } from '../fixtures'
import {
  createMediaSession,
  hasNewMediaUploads,
  isMediaSessionDirty,
  mediaSessionReducer,
  type DeriveMediaAvailability,
} from './media-session'

const characterRoles = ['portrait', 'primary'] as const

const deriveUploadAvailability: DeriveMediaAvailability = (media: ContentMedia) =>
  resolveAvailableContentMediaSources({
    media,
    domain: 'character',
    contentSource: 'homebrew',
  })

function availabilityFor(media: ContentMedia) {
  return deriveUploadAvailability(media)
}

function reduce(
  state: ReturnType<typeof createMediaSession>,
  action: Parameters<typeof mediaSessionReducer>[1],
) {
  return mediaSessionReducer(state, action, deriveUploadAvailability)
}

function openSession(
  media: ContentMedia,
  initialSelectedImageId?: string,
  allowedRoles: readonly ('portrait' | 'primary')[] = characterRoles,
) {
  return createMediaSession(media, initialSelectedImageId, allowedRoles, availabilityFor(media))
}

describe('isolated media session', () => {
  it('honors a valid requested selection and falls back when it is stale', () => {
    expect(openSession(mediaFixture, 'image-1').selectedId).toBe('image-1')
    expect(openSession(mediaFixture, 'missing').selectedId).toBe(
      roleAssignmentUploadImageId(mediaFixture.roles.portrait),
    )
  })

  it('preserves parent and other presentations while editing and switching', () => {
    const initial = structuredClone(mediaFixture)
    let state = openSession(initial)
    const crop = { x: 0.1, y: 0.2, width: 0.6, height: 0.4 }
    state = reduce(state, { type: 'presentation', role: 'portrait' })
    state = reduce(state, { type: 'crop', crop })
    state = reduce(state, {
      type: 'select',
      id: 'image-1',
      allowedRoles: characterRoles,
    })
    state = reduce(state, { type: 'alt', id: 'image-1', alt: 'New description' })
    expect(state.media.roles.portrait?.presentation).toEqual({
      mode: 'crop',
      crop,
      focalPoint: focalPointFromCropCenter(crop),
    })
    expect(state.media.roles.primary).toEqual(initial.roles.primary)
    expect(initial).toEqual(mediaFixture)
    expect(isMediaSessionDirty(state)).toBe(true)
    expect(openSession(initial).media).toEqual(initial)
  })

  it('clears every assigned role on removal without promotion', () => {
    let state = openSession({
      ...mediaFixture,
      roles: {
        portrait: createUploadRoleAssignment('image-0'),
        primary: createUploadRoleAssignment('image-0'),
      },
    })
    state = reduce(state, {
      type: 'remove',
      id: 'image-0',
      allowedRoles: characterRoles,
    })
    expect(state.media.roles).toEqual({})
    expect(state.selectedId).toBe('image-1')
  })

  it('restores a removed image at its original index with roles', () => {
    let state = openSession(
      {
        ...mediaFixture,
        roles: {
          portrait: createUploadRoleAssignment('image-0'),
          primary: createUploadRoleAssignment('image-0'),
        },
      },
      'image-0',
    )
    const removed = structuredClone(state.media.images[0]!)
    const roles = {
      portrait: structuredClone(state.media.roles.portrait!),
      primary: structuredClone(state.media.roles.primary!),
    }
    state = reduce(state, {
      type: 'remove',
      id: 'image-0',
      allowedRoles: characterRoles,
    })
    state = reduce(state, {
      type: 'restoreRemoved',
      image: removed,
      index: 0,
      roles,
      restoreSelection: true,
      allowedRoles: characterRoles,
    })
    expect(state.media.images[0]?.id).toBe('image-0')
    expect(roleAssignmentUploadImageId(state.media.roles.portrait)).toBe('image-0')
    expect(state.selectedId).toBe('image-0')
  })

  it('deduplicates source assets and never implicitly assigns a role', () => {
    let state = openSession({ revision: 0, images: [], roles: {} })
    state = reduce(state, { type: 'add', id: 'a', asset: mediaFixtureAssets[0]! })
    state = reduce(state, { type: 'add', id: 'b', asset: mediaFixtureAssets[0]! })
    expect(state.media.images).toHaveLength(1)
    expect(state.media.roles).toEqual({})
  })

  it('selects the first image added to an empty collection', () => {
    let state = openSession({ revision: 0, images: [], roles: {} })
    state = reduce(state, { type: 'add', id: 'a', asset: mediaFixtureAssets[0]! })
    expect(state.selectedId).toBe('a')
  })

  it('preserves the open selection when later images finish uploading', () => {
    let state = openSession({ revision: 0, images: [], roles: {} })
    state = reduce(state, { type: 'add', id: 'a', asset: mediaFixtureAssets[0]! })
    state = reduce(state, { type: 'add', id: 'b', asset: mediaFixtureAssets[1]! })
    expect(state.selectedId).toBe('a')
  })

  it('transfers one role without disturbing the other role or parent revision', () => {
    const state = reduce(openSession(mediaFixture), {
      type: 'role',
      id: 'image-1',
      role: 'portrait',
      assigned: true,
      allowedRoles: characterRoles,
      source: { width: 2400, height: 1600 },
    })
    expect(roleAssignmentUploadImageId(state.media.roles.portrait)).toBe('image-1')
    expect(state.media.roles.primary).toEqual(mediaFixture.roles.primary)
    expect(state.media.revision).toBe(mediaFixture.revision)
  })

  it('detects new uploads that were not in the initial session', () => {
    let state = openSession({ revision: 0, images: [], roles: {} })
    expect(hasNewMediaUploads(state)).toBe(false)
    state = reduce(state, { type: 'add', id: 'a', asset: mediaFixtureAssets[0]! })
    expect(hasNewMediaUploads(state)).toBe(true)
  })
})
