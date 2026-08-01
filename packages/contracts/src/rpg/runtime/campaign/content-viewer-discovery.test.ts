import { describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '../../content/lib/campaign-access'
import type { ContentViewer } from '../../campaign/campaign-content-viewer'
import {
  isContentDiscoverableForViewer,
  toPlayerContentVisibility,
} from './content-viewer-discovery'

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

describe('toPlayerContentVisibility', () => {
  it('returns ordinary for non-specific access and non-pc viewers', () => {
    expect(toPlayerContentVisibility(access(), { kind: 'none' })).toEqual({ kind: 'ordinary' })
    expect(toPlayerContentVisibility(access({ visibilityMode: 'dm_only' }), pcViewer)).toEqual({
      kind: 'ordinary',
    })
  })

  it('returns specific visibility with other participant count for granted PCs', () => {
    expect(
      toPlayerContentVisibility(
        access({
          visibilityMode: 'specific_players',
          participantIds: ['char-a', 'char-c'],
        }),
        pcViewer,
      ),
    ).toEqual({ kind: 'specific', otherParticipantCount: 1 })
  })

  it('returns ordinary when the viewer is not granted specific access', () => {
    expect(
      toPlayerContentVisibility(
        access({
          visibilityMode: 'specific_players',
          participantIds: ['char-x'],
        }),
        pcViewer,
      ),
    ).toEqual({ kind: 'ordinary' })
  })
})
