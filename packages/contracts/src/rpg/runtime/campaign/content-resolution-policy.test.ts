import { describe, expect, it } from 'vitest'

import type { ContentViewer } from '../../campaign/campaign-content-viewer'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '../../content/lib/campaign-access'
import type { ContentPlayActor } from './content-play-actor'
import {
  isContentCampaignEligible,
  isContentPlayableFor,
  isContentReferenceable,
  isContentVisibleToViewer,
  type ContentResolutionRow,
} from './content-resolution-policy'

const manageViewer: ContentViewer = { kind: 'manage' }
const pcViewer: ContentViewer = { kind: 'pc', characterIds: ['char-a', 'char-b'] }
const noneViewer: ContentViewer = { kind: 'none' }

const npcPlayActor: ContentPlayActor = { kind: 'npc' }
const newPcPlayActor: ContentPlayActor = { kind: 'new_pc' }
const pcAPlayActor: ContentPlayActor = { kind: 'pc', characterId: 'char-a' }
const pcBPlayActor: ContentPlayActor = { kind: 'pc', characterId: 'char-b' }

function row(overrides: Partial<ContentResolutionRow> = {}): ContentResolutionRow {
  return {
    status: 'published',
    campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    ...overrides,
  }
}

function access(
  overrides: Partial<typeof DEFAULT_CONTENT_CAMPAIGN_ACCESS> = {},
): typeof DEFAULT_CONTENT_CAMPAIGN_ACCESS {
  return { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, ...overrides }
}

describe('content resolution policy matrix', () => {
  const cases = [
    {
      name: 'published all_players available',
      row: row(),
      visible: { manage: true, pc: true, none: true },
      referenceable: true,
      campaignEligible: true,
      playable: { npc: true, newPc: true, pcA: true, pcB: true },
    },
    {
      name: 'draft',
      row: row({ status: 'draft' }),
      visible: { manage: true, pc: false, none: false },
      referenceable: false,
      campaignEligible: false,
      playable: { npc: false, newPc: false, pcA: false, pcB: false },
    },
    {
      name: 'unavailable',
      row: row({
        campaignAccess: access({ available: false, effectiveAudience: 'none' }),
      }),
      visible: { manage: true, pc: false, none: false },
      referenceable: true,
      campaignEligible: false,
      playable: { npc: false, newPc: false, pcA: false, pcB: false },
    },
    {
      name: 'dm_only',
      row: row({ campaignAccess: access({ visibilityMode: 'dm_only' }) }),
      visible: { manage: true, pc: false, none: false },
      referenceable: true,
      campaignEligible: true,
      playable: { npc: true, newPc: false, pcA: false, pcB: false },
    },
    {
      name: 'specific_players granted to char-a only',
      row: row({
        campaignAccess: access({
          visibilityMode: 'specific_players',
          participantIds: ['char-a'],
        }),
      }),
      visible: { manage: true, pc: true, none: false },
      referenceable: true,
      campaignEligible: true,
      playable: { npc: false, newPc: false, pcA: true, pcB: false },
    },
  ] as const

  it.each(cases)(
    '$name',
    ({ row: testRow, visible, referenceable, campaignEligible, playable }) => {
      expect(isContentVisibleToViewer(testRow, manageViewer)).toBe(visible.manage)
      expect(isContentVisibleToViewer(testRow, pcViewer)).toBe(visible.pc)
      expect(isContentVisibleToViewer(testRow, noneViewer)).toBe(visible.none)
      expect(isContentReferenceable(testRow)).toBe(referenceable)
      expect(isContentCampaignEligible(testRow)).toBe(campaignEligible)
      expect(isContentPlayableFor(testRow, npcPlayActor)).toBe(playable.npc)
      expect(isContentPlayableFor(testRow, newPcPlayActor)).toBe(playable.newPc)
      expect(isContentPlayableFor(testRow, pcAPlayActor)).toBe(playable.pcA)
      expect(isContentPlayableFor(testRow, pcBPlayActor)).toBe(playable.pcB)
    },
  )
})

describe('isContentPlayableFor', () => {
  it('does not treat manage visibility as playable for draft content', () => {
    const draftRow = row({ status: 'draft' })
    expect(isContentPlayableFor(draftRow, npcPlayActor)).toBe(false)
    expect(isContentPlayableFor(draftRow, newPcPlayActor)).toBe(false)
  })

  it('does not grant new_pc sibling specific_players content', () => {
    const specificPlayersRow = row({
      campaignAccess: access({
        visibilityMode: 'specific_players',
        participantIds: ['char-a'],
      }),
    })

    expect(isContentPlayableFor(specificPlayersRow, pcAPlayActor)).toBe(true)
    expect(isContentPlayableFor(specificPlayersRow, newPcPlayActor)).toBe(false)
  })

  it('does not grant PC actors dm_only content regardless of viewer privilege', () => {
    const dmOnlyRow = row({ campaignAccess: access({ visibilityMode: 'dm_only' }) })

    expect(isContentPlayableFor(dmOnlyRow, newPcPlayActor)).toBe(false)
    expect(isContentPlayableFor(dmOnlyRow, pcAPlayActor)).toBe(false)
    expect(isContentPlayableFor(dmOnlyRow, npcPlayActor)).toBe(true)
  })
})
