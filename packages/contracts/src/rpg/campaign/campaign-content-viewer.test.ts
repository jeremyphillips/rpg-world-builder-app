import { describe, expect, it } from 'vitest'

import {
  buildContentViewerFromCampaignContext,
  canResolveSavedContentReference,
  type ContentViewer,
} from './campaign-content-viewer'

const manageViewer: ContentViewer = { kind: 'manage' }
const pcViewer: ContentViewer = { kind: 'pc', characterIds: ['char-a', 'char-b'] }
const noneViewer: ContentViewer = { kind: 'none' }

describe('buildContentViewerFromCampaignContext', () => {
  it('maps campaign roles to viewer kinds', () => {
    expect(
      buildContentViewerFromCampaignContext({ campaignRole: 'owner', pcCharacterIds: [] }),
    ).toEqual({
      kind: 'manage',
    })
    expect(
      buildContentViewerFromCampaignContext({
        campaignRole: 'co-owner',
        pcCharacterIds: ['pc-1'],
      }),
    ).toEqual({ kind: 'manage' })
    expect(
      buildContentViewerFromCampaignContext({
        campaignRole: 'pc',
        pcCharacterIds: ['pc-1', 'pc-2'],
      }),
    ).toEqual({ kind: 'pc', characterIds: ['pc-1', 'pc-2'] })
    expect(
      buildContentViewerFromCampaignContext({ campaignRole: 'observer', pcCharacterIds: [] }),
    ).toEqual({ kind: 'none' })
    expect(
      buildContentViewerFromCampaignContext({ campaignRole: 'pc', pcCharacterIds: [] }),
    ).toEqual({ kind: 'none' })
    expect(buildContentViewerFromCampaignContext(undefined)).toEqual({ kind: 'none' })
  })
})

describe('canResolveSavedContentReference', () => {
  it('allows managers to resolve any saved reference', () => {
    expect(canResolveSavedContentReference(manageViewer, { characterId: 'char-a' })).toBe(true)
  })

  it('allows a PC viewer when the reference character is on their membership', () => {
    expect(canResolveSavedContentReference(pcViewer, { characterId: 'char-a' })).toBe(true)
    expect(canResolveSavedContentReference(pcViewer, { characterId: 'char-b' })).toBe(true)
  })

  it('denies observers and PCs without the reference character', () => {
    expect(canResolveSavedContentReference(noneViewer, { characterId: 'char-a' })).toBe(false)
    expect(canResolveSavedContentReference(pcViewer, { characterId: 'char-other' })).toBe(false)
  })

  it('does not consult campaign access — saved references survive availability changes', () => {
    expect(canResolveSavedContentReference(pcViewer, { characterId: 'char-a' })).toBe(true)
  })
})
