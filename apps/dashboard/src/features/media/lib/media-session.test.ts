import { createUploadRoleAssignment, roleAssignmentUploadImageId } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'
import { mediaFixture, mediaFixtureAssets } from '../fixtures'
import {
  createMediaSession,
  hasNewMediaUploads,
  isMediaSessionDirty,
  mediaSessionReducer,
} from './media-session'

const characterRoles = ['portrait', 'primary'] as const

describe('isolated media session', () => {
  it('honors a valid requested selection and falls back when it is stale', () => {
    expect(createMediaSession(mediaFixture, 'image-1', characterRoles).selectedId).toBe('image-1')
    expect(createMediaSession(mediaFixture, 'missing', characterRoles).selectedId).toBe(
      roleAssignmentUploadImageId(mediaFixture.roles.portrait),
    )
  })

  it('preserves parent and other presentations while editing and switching', () => {
    const initial = structuredClone(mediaFixture)
    let state = createMediaSession(initial, undefined, characterRoles)
    const crop = { x: 0.1, y: 0.2, width: 0.6, height: 0.4 }
    state = mediaSessionReducer(state, { type: 'presentation', role: 'portrait' })
    state = mediaSessionReducer(state, { type: 'crop', crop })
    state = mediaSessionReducer(state, {
      type: 'select',
      id: 'image-1',
      allowedRoles: characterRoles,
    })
    state = mediaSessionReducer(state, { type: 'alt', id: 'image-1', alt: 'New description' })
    expect(state.media.roles.portrait?.presentation).toEqual({ mode: 'crop', crop })
    expect(state.media.roles.primary).toEqual(initial.roles.primary)
    expect(initial).toEqual(mediaFixture)
    expect(isMediaSessionDirty(state)).toBe(true)
    expect(createMediaSession(initial, undefined, characterRoles).media).toEqual(initial)
  })

  it('clears every assigned role on removal without promotion', () => {
    let state = createMediaSession(
      {
        ...mediaFixture,
        roles: {
          portrait: createUploadRoleAssignment('image-0'),
          primary: createUploadRoleAssignment('image-0'),
        },
      },
      undefined,
      characterRoles,
    )
    state = mediaSessionReducer(state, {
      type: 'remove',
      id: 'image-0',
      allowedRoles: characterRoles,
    })
    expect(state.media.roles).toEqual({})
    expect(state.selectedId).toBe('image-1')
  })

  it('restores a removed image at its original index with roles', () => {
    let state = createMediaSession(
      {
        ...mediaFixture,
        roles: {
          portrait: createUploadRoleAssignment('image-0'),
          primary: createUploadRoleAssignment('image-0'),
        },
      },
      'image-0',
      characterRoles,
    )
    const removed = structuredClone(state.media.images[0]!)
    const roles = {
      portrait: structuredClone(state.media.roles.portrait!),
      primary: structuredClone(state.media.roles.primary!),
    }
    state = mediaSessionReducer(state, {
      type: 'remove',
      id: 'image-0',
      allowedRoles: characterRoles,
    })
    state = mediaSessionReducer(state, {
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
    let state = createMediaSession(
      { revision: 0, images: [], roles: {} },
      undefined,
      characterRoles,
    )
    state = mediaSessionReducer(state, { type: 'add', id: 'a', asset: mediaFixtureAssets[0]! })
    state = mediaSessionReducer(state, { type: 'add', id: 'b', asset: mediaFixtureAssets[0]! })
    expect(state.media.images).toHaveLength(1)
    expect(state.media.roles).toEqual({})
  })

  it('selects the first image added to an empty collection', () => {
    let state = createMediaSession(
      { revision: 0, images: [], roles: {} },
      undefined,
      characterRoles,
    )
    state = mediaSessionReducer(state, { type: 'add', id: 'a', asset: mediaFixtureAssets[0]! })
    expect(state.selectedId).toBe('a')
  })

  it('preserves the open selection when later images finish uploading', () => {
    let state = createMediaSession(
      { revision: 0, images: [], roles: {} },
      undefined,
      characterRoles,
    )
    state = mediaSessionReducer(state, { type: 'add', id: 'a', asset: mediaFixtureAssets[0]! })
    state = mediaSessionReducer(state, { type: 'add', id: 'b', asset: mediaFixtureAssets[1]! })
    expect(state.selectedId).toBe('a')
  })

  it('transfers one role without disturbing the other role or parent revision', () => {
    const state = mediaSessionReducer(createMediaSession(mediaFixture, undefined, characterRoles), {
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
    let state = createMediaSession(
      { revision: 0, images: [], roles: {} },
      undefined,
      characterRoles,
    )
    expect(hasNewMediaUploads(state)).toBe(false)
    state = mediaSessionReducer(state, { type: 'add', id: 'a', asset: mediaFixtureAssets[0]! })
    expect(hasNewMediaUploads(state)).toBe(true)
  })
})
