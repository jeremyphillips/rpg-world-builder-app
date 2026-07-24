import { describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from './campaign-access'
import {
  canResolveSavedContentReference,
  isContentDiscoverableForViewer,
  type ContentViewer,
} from './content-viewer-access'

const manageViewer: ContentViewer = { kind: 'manage' }
const pcViewer: ContentViewer = { kind: 'pc', characterIds: ['char-a', 'char-b'] }
const noneViewer: ContentViewer = { kind: 'none' }

function access(
  overrides: Partial<typeof DEFAULT_CONTENT_CAMPAIGN_ACCESS> = {},
): typeof DEFAULT_CONTENT_CAMPAIGN_ACCESS {
  return { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, ...overrides }
}

describe('isContentDiscoverableForViewer', () => {
  it('allows managers regardless of campaign access', () => {
    expect(
      isContentDiscoverableForViewer(
        access({ available: false, effectiveAudience: 'none' }),
        manageViewer,
      ),
    ).toBe(true)
    expect(
      isContentDiscoverableForViewer(access({ visibilityMode: 'dm_only' }), manageViewer),
    ).toBe(true)
    expect(
      isContentDiscoverableForViewer(
        access({ visibilityMode: 'specific_players', participantIds: ['other-pc'] }),
        manageViewer,
      ),
    ).toBe(true)
  })

  it('hides unavailable content from non-managers', () => {
    expect(
      isContentDiscoverableForViewer(
        access({ available: false, effectiveAudience: 'none' }),
        pcViewer,
      ),
    ).toBe(false)
    expect(
      isContentDiscoverableForViewer(
        access({ available: false, effectiveAudience: 'none' }),
        noneViewer,
      ),
    ).toBe(false)
  })

  it('hides dm_only content from non-managers', () => {
    expect(isContentDiscoverableForViewer(access({ visibilityMode: 'dm_only' }), pcViewer)).toBe(
      false,
    )
    expect(isContentDiscoverableForViewer(access({ visibilityMode: 'dm_only' }), noneViewer)).toBe(
      false,
    )
  })

  it('shows all_players content to any non-manager viewer', () => {
    expect(
      isContentDiscoverableForViewer(access({ visibilityMode: 'all_players' }), pcViewer),
    ).toBe(true)
    expect(
      isContentDiscoverableForViewer(access({ visibilityMode: 'all_players' }), noneViewer),
    ).toBe(true)
  })

  it('defensively hides specific_players content unless a viewer PC is granted', () => {
    const restricted = access({
      visibilityMode: 'specific_players',
      participantIds: ['char-b', 'char-c'],
    })

    expect(isContentDiscoverableForViewer(restricted, pcViewer)).toBe(true)
    expect(
      isContentDiscoverableForViewer(restricted, { kind: 'pc', characterIds: ['char-x'] }),
    ).toBe(false)
    expect(isContentDiscoverableForViewer(restricted, noneViewer)).toBe(false)
    expect(isContentDiscoverableForViewer(restricted, { kind: 'pc', characterIds: [] })).toBe(false)
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
    // Discovery would hide this; reference policy is independent.
    expect(canResolveSavedContentReference(pcViewer, { characterId: 'char-a' })).toBe(true)
  })
})
