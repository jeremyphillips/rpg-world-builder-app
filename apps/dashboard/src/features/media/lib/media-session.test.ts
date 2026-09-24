import { describe, expect, it } from 'vitest'
import { mediaFixture, mediaFixtureAssets } from '../fixtures'
import { createMediaSession, isMediaSessionDirty, mediaSessionReducer } from './media-session'

describe('isolated media session', () => {
  it('honors a valid requested selection and falls back when it is stale', () => {
    expect(createMediaSession(mediaFixture, 'image-1').selectedId).toBe('image-1')
    expect(createMediaSession(mediaFixture, 'missing').selectedId).toBe(
      mediaFixture.roles.portrait?.imageId,
    )
  })
  it('preserves parent and other presentations while editing and switching', () => {
    const initial = structuredClone(mediaFixture)
    let state = createMediaSession(initial)
    const crop = { x: 0.1, y: 0.2, width: 0.6, height: 0.4 }
    state = mediaSessionReducer(state, { type: 'crop', crop })
    state = mediaSessionReducer(state, { type: 'select', id: 'image-1' })
    state = mediaSessionReducer(state, { type: 'alt', id: 'image-1', alt: 'New description' })
    expect(state.media.roles.portrait?.presentation?.crop).toEqual(crop)
    expect(state.media.roles.primary).toEqual(initial.roles.primary)
    expect(initial).toEqual(mediaFixture)
    expect(isMediaSessionDirty(state)).toBe(true)
    expect(createMediaSession(initial).media).toEqual(initial)
  })
  it('clears every assigned role on removal without promotion', () => {
    let state = createMediaSession({
      ...mediaFixture,
      roles: { portrait: { imageId: 'image-0' }, primary: { imageId: 'image-0' } },
    })
    state = mediaSessionReducer(state, { type: 'remove', id: 'image-0' })
    expect(state.media.roles).toEqual({})
    expect(state.selectedId).toBe('image-1')
  })
  it('deduplicates source assets and never implicitly assigns a role', () => {
    let state = createMediaSession({ revision: 0, images: [], roles: {} })
    state = mediaSessionReducer(state, { type: 'add', id: 'a', asset: mediaFixtureAssets[0]! })
    state = mediaSessionReducer(state, { type: 'add', id: 'b', asset: mediaFixtureAssets[0]! })
    expect(state.media.images).toHaveLength(1)
    expect(state.media.roles).toEqual({})
  })
  it('selects the first image added to an empty collection', () => {
    let state = createMediaSession({ revision: 0, images: [], roles: {} })
    state = mediaSessionReducer(state, { type: 'add', id: 'a', asset: mediaFixtureAssets[0]! })
    expect(state.selectedId).toBe('a')
    expect(state.notice).toEqual({
      kind: 'image-added',
      filename: mediaFixtureAssets[0]!.filename,
    })
  })
  it('preserves the open selection when later images finish uploading', () => {
    let state = createMediaSession({ revision: 0, images: [], roles: {} })
    state = mediaSessionReducer(state, { type: 'add', id: 'a', asset: mediaFixtureAssets[0]! })
    state = mediaSessionReducer(state, { type: 'add', id: 'b', asset: mediaFixtureAssets[1]! })
    expect(state.selectedId).toBe('a')
  })
  it('transfers one role without disturbing the other role or parent revision', () => {
    const state = mediaSessionReducer(createMediaSession(mediaFixture), {
      type: 'role',
      id: 'image-1',
      role: 'portrait',
      assigned: true,
    })
    expect(state.media.roles.portrait).toEqual({ imageId: 'image-1' })
    expect(state.media.roles.primary).toEqual(mediaFixture.roles.primary)
    expect(state.media.revision).toBe(mediaFixture.revision)
  })
})
