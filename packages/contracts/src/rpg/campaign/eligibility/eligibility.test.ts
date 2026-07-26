import { describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '../../content/lib/campaign-access'
import type { Character } from '../../runtime/character/sheet'
import {
  primaryBlockingIssue,
  sortBlockingIssuesByPriority,
} from './character-campaign-eligibility'
import { resolveCharacterCampaignEligibility } from './resolve-character-campaign-eligibility'
import { resolveCharacterContentEligibility } from './resolve-character-content-eligibility'
import { resolveCharacterParticipationEligibility } from './resolve-character-participation-eligibility'
import { resolveCharacterStartingLevelEligibility } from './resolve-character-starting-level-eligibility'

const timestamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

const basePc: Character = {
  id: 'char_1',
  name: 'Mira',
  rulesetId: 'srd-cc-5.2.1',
  characterType: 'pc',
  userId: 'user_1',
  classes: [
    {
      classId: 'srd-cc-5.2.1:wizard',
      subclassId: 'srd-cc-5.2.1:evoker',
      level: 3,
    },
  ],
  species: { id: 'srd-cc-5.2.1:elf', heritageId: 'high-elf' },
  alignment: 'ng',
  xp: 900,
  abilityScores: { str: 8, dex: 14, con: 12, int: 16, wis: 10, cha: 10 },
  hitPoints: { base: 18, current: 18, temporary: 0 },
  proficiencies: { skills: [], weapons: [], armor: [], tools: [], languages: [] },
  spells: [
    {
      spellId: 'srd-cc-5.2.1:silvery-barbs',
      access: { granted: true },
      castingEntitlements: [],
      sources: [],
    },
  ],
  equipment: {
    weapons: [
      { entryId: 'w1', equipmentId: 'srd-cc-5.2.1:quarterstaff', equipped: true, quantity: 1 },
    ],
    armor: [],
    gear: [],
    tools: [],
    vehicles: [],
    mounts: [],
    magicItems: [],
  },
  wealth: { cp: 0, sp: 0, gp: 10, pp: 0 },
  feats: [],
  vital: { status: 'alive' },
  ...timestamps,
}

const dmOnlyAccess = {
  ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  visibilityMode: 'dm_only' as const,
  effectiveAudience: 'dm_only' as const,
}

const specificPlayersAccess = (participantIds: string[]) => ({
  ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  visibilityMode: 'specific_players' as const,
  participantIds,
  effectiveAudience: 'specific_players' as const,
})

describe('resolveCharacterParticipationEligibility', () => {
  it('blocks characters not owned by the user', () => {
    const result = resolveCharacterParticipationEligibility({
      character: basePc,
      userId: 'other_user',
      campaignId: 'camp_1',
    })

    expect(result.blockingIssues).toEqual([{ code: 'not_owned_pc' }])
  })

  it('blocks conflicting open participation with campaign name payload', () => {
    const result = resolveCharacterParticipationEligibility({
      character: basePc,
      userId: 'user_1',
      campaignId: 'camp_2',
      existingOpenParticipation: { campaignId: 'camp_1' },
      conflictingCampaignName: 'The Shattered Vale',
    })

    expect(result.blockingIssues[0]).toEqual({
      code: 'conflicting_open_participation',
      conflictingCampaignName: 'The Shattered Vale',
    })
  })
})

describe('resolveCharacterStartingLevelEligibility', () => {
  it('reports structured level mismatch data', () => {
    const result = resolveCharacterStartingLevelEligibility({
      character: basePc,
      startingLevel: 1,
    })

    expect(result.blockingIssues[0]).toEqual({
      code: 'level_mismatch',
      actualLevel: 3,
      requiredLevel: 1,
    })
  })
})

describe('resolveCharacterContentEligibility', () => {
  it('uses prospective pc viewer for specific_players grants', () => {
    const campaignContentById = new Map([
      ['srd-cc-5.2.1:elf', { access: specificPlayersAccess(['char_1']), label: 'Elf' }],
    ])

    const granted = resolveCharacterContentEligibility({
      character: basePc,
      campaignContentById,
      viewer: { kind: 'pc', characterIds: ['char_1'] },
    })
    expect(granted.blockingIssues).toHaveLength(0)

    const blocked = resolveCharacterContentEligibility({
      character: basePc,
      campaignContentById,
      viewer: { kind: 'none' },
    })
    expect(blocked.blockingIssues[0]?.code).toBe('species_unavailable')
  })

  it('emits warnings for unavailable equipment without blocking submit', () => {
    const campaignContentById = new Map([
      ['srd-cc-5.2.1:quarterstaff', { access: dmOnlyAccess, label: 'Quarterstaff' }],
    ])

    const result = resolveCharacterContentEligibility({
      character: basePc,
      campaignContentById,
      viewer: { kind: 'pc', characterIds: ['char_1'] },
    })

    expect(result.blockingIssues).toHaveLength(0)
    expect(result.warnings[0]).toMatchObject({
      code: 'content_unavailable',
      category: 'equipment',
      label: 'Quarterstaff',
    })
  })
})

describe('resolveCharacterCampaignEligibility', () => {
  it('aggregates blocking issues in priority order', () => {
    const result = resolveCharacterCampaignEligibility({
      character: { ...basePc, userId: 'other_user' } as Character,
      userId: 'user_1',
      campaignId: 'camp_1',
      startingLevel: 1,
      campaignContentById: new Map(),
      viewer: { kind: 'none' },
    })

    expect(result.eligible).toBe(false)
    expect(primaryBlockingIssue(result.blockingIssues)?.code).toBe('not_owned_pc')
  })

  it('returns eligible with warnings when only soft content mismatches exist', () => {
    const campaignContentById = new Map([
      ['srd-cc-5.2.1:silvery-barbs', { access: dmOnlyAccess, label: 'Silvery Barbs' }],
    ])

    const result = resolveCharacterCampaignEligibility({
      character: basePc,
      userId: 'user_1',
      campaignId: 'camp_1',
      startingLevel: 3,
      campaignContentById,
      viewer: { kind: 'pc', characterIds: ['char_1'] },
    })

    expect(result.eligible).toBe(true)
    expect(result.warnings).toHaveLength(1)
  })
})

describe('blocking issue priority helpers', () => {
  it('sorts issues by deterministic priority', () => {
    const sorted = sortBlockingIssuesByPriority([
      { code: 'level_mismatch', actualLevel: 3, requiredLevel: 1 },
      { code: 'not_owned_pc' },
      { code: 'species_unavailable', contentId: 'x', label: 'Elf' },
    ])

    expect(sorted.map((issue) => issue.code)).toEqual([
      'not_owned_pc',
      'level_mismatch',
      'species_unavailable',
    ])
  })
})
