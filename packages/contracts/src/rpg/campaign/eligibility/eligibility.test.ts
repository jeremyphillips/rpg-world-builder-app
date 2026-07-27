import { describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '../../content/lib/campaign-access'
import type { Character } from '../../runtime/character/sheet'
import {
  createCampaignContentEligibilityIndex,
  projectCharacterEligibilitySubjectFromCharacter,
  type CampaignContentEligibilityEntry,
} from './index'
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

const baseSubject = projectCharacterEligibilitySubjectFromCharacter(basePc)

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

function makeContentIndex(
  contentById: ReadonlyMap<string, CampaignContentEligibilityEntry>,
  options: Parameters<typeof createCampaignContentEligibilityIndex>[1] = {},
) {
  return createCampaignContentEligibilityIndex(contentById, options)
}

describe('resolveCharacterParticipationEligibility', () => {
  it('blocks characters not owned by the user', () => {
    const result = resolveCharacterParticipationEligibility({
      subject: { ...baseSubject, userId: 'other_user' },
      userId: 'user_1',
      campaignId: 'camp_1',
    })

    expect(result.blockingIssues).toEqual([{ code: 'not_owned_pc' }])
  })

  it('blocks conflicting open participation with campaign name payload', () => {
    const result = resolveCharacterParticipationEligibility({
      subject: baseSubject,
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
      subject: baseSubject,
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
    const defaultAccess = DEFAULT_CONTENT_CAMPAIGN_ACCESS
    const contentIndex = makeContentIndex(
      new Map([
        ['srd-cc-5.2.1:elf', { access: specificPlayersAccess(['char_1']), label: 'Elf' }],
        ['srd-cc-5.2.1:wizard', { access: defaultAccess, label: 'Wizard' }],
        ['srd-cc-5.2.1:evoker', { access: defaultAccess, label: 'Evoker' }],
        ['srd-cc-5.2.1:quarterstaff', { access: defaultAccess, label: 'Quarterstaff' }],
        ['srd-cc-5.2.1:silvery-barbs', { access: defaultAccess, label: 'Silvery Barbs' }],
      ]),
      {
        heritageBySpeciesId: new Map([
          [
            'srd-cc-5.2.1:elf',
            new Map([['high-elf', { speciesId: 'srd-cc-5.2.1:elf', label: 'High Elf' }]]),
          ],
        ]),
      },
    )

    const granted = resolveCharacterContentEligibility({
      subject: baseSubject,
      contentIndex,
      viewer: { kind: 'pc', characterIds: ['char_1'] },
    })
    expect(granted.blockingIssues).toHaveLength(0)

    const blocked = resolveCharacterContentEligibility({
      subject: baseSubject,
      contentIndex,
      viewer: { kind: 'none' },
    })
    expect(blocked.blockingIssues[0]?.code).toBe('species_unavailable')
  })

  it('emits warnings for unavailable equipment without blocking submit', () => {
    const defaultAccess = DEFAULT_CONTENT_CAMPAIGN_ACCESS
    const contentIndex = makeContentIndex(
      new Map([
        ['srd-cc-5.2.1:elf', { access: defaultAccess, label: 'Elf' }],
        ['srd-cc-5.2.1:wizard', { access: defaultAccess, label: 'Wizard' }],
        ['srd-cc-5.2.1:evoker', { access: defaultAccess, label: 'Evoker' }],
        ['srd-cc-5.2.1:quarterstaff', { access: dmOnlyAccess, label: 'Quarterstaff' }],
      ]),
      {
        heritageBySpeciesId: new Map([
          [
            'srd-cc-5.2.1:elf',
            new Map([['high-elf', { speciesId: 'srd-cc-5.2.1:elf', label: 'High Elf' }]]),
          ],
        ]),
      },
    )

    const result = resolveCharacterContentEligibility({
      subject: {
        ...baseSubject,
        spells: [],
      },
      contentIndex,
      viewer: { kind: 'pc', characterIds: ['char_1'] },
    })

    expect(result.blockingIssues).toHaveLength(0)
    expect(result.warnings[0]).toMatchObject({
      code: 'content_unavailable',
      category: 'equipment',
      label: 'Quarterstaff',
    })
  })

  it('emits content_missing when a blocking reference is absent from the index', () => {
    const contentIndex = makeContentIndex(new Map())

    const result = resolveCharacterContentEligibility({
      subject: baseSubject,
      contentIndex,
      viewer: { kind: 'none' },
    })

    expect(result.blockingIssues).toEqual(
      expect.arrayContaining([
        {
          code: 'content_missing',
          contentType: 'species',
          contentId: 'srd-cc-5.2.1:elf',
        },
        {
          code: 'content_missing',
          contentType: 'class',
          contentId: 'srd-cc-5.2.1:wizard',
        },
        {
          code: 'content_missing',
          contentType: 'subclass',
          contentId: 'srd-cc-5.2.1:evoker',
        },
      ]),
    )
  })

  it('resolves skill proficiency slugs through the skillsBySlug index', () => {
    const defaultAccess = DEFAULT_CONTENT_CAMPAIGN_ACCESS
    const contentIndex = makeContentIndex(
      new Map([
        ['srd-cc-5.2.1:elf', { access: defaultAccess, label: 'Elf' }],
        ['srd-cc-5.2.1:wizard', { access: defaultAccess, label: 'Wizard' }],
        ['srd-cc-5.2.1:evoker', { access: defaultAccess, label: 'Evoker' }],
      ]),
      {
        skillsBySlug: new Map([['athletics', { access: dmOnlyAccess, label: 'Athletics' }]]),
        heritageBySpeciesId: new Map([
          [
            'srd-cc-5.2.1:elf',
            new Map([['high-elf', { speciesId: 'srd-cc-5.2.1:elf', label: 'High Elf' }]]),
          ],
        ]),
      },
    )

    const result = resolveCharacterContentEligibility({
      subject: {
        ...baseSubject,
        equipment: {
          weapons: [],
          armor: [],
          gear: [],
          tools: [],
          vehicles: [],
          mounts: [],
          magicItems: [],
        },
        spells: [],
        proficiencies: {
          ...baseSubject.proficiencies,
          skills: [{ skill: 'athletics', rank: 'proficient', sources: [] }],
        },
      },
      contentIndex,
      viewer: { kind: 'none' },
    })

    expect(result.blockingIssues).toHaveLength(0)
    expect(result.warnings[0]).toMatchObject({
      code: 'content_unavailable',
      category: 'proficiencies',
      contentId: 'athletics',
      label: 'Athletics',
    })
  })
})

describe('resolveCharacterCampaignEligibility', () => {
  it('aggregates blocking issues in priority order', () => {
    const result = resolveCharacterCampaignEligibility({
      subject: { ...baseSubject, userId: 'other_user' },
      userId: 'user_1',
      campaignId: 'camp_1',
      startingLevel: 1,
      contentIndex: makeContentIndex(new Map()),
      viewer: { kind: 'none' },
    })

    expect(result.eligible).toBe(false)
    expect(primaryBlockingIssue(result.blockingIssues)?.code).toBe('not_owned_pc')
  })

  it('returns eligible with warnings when only soft content mismatches exist', () => {
    const contentIndex = makeContentIndex(
      new Map([
        ['srd-cc-5.2.1:elf', { access: DEFAULT_CONTENT_CAMPAIGN_ACCESS, label: 'Elf' }],
        ['srd-cc-5.2.1:wizard', { access: DEFAULT_CONTENT_CAMPAIGN_ACCESS, label: 'Wizard' }],
        ['srd-cc-5.2.1:evoker', { access: DEFAULT_CONTENT_CAMPAIGN_ACCESS, label: 'Evoker' }],
        ['srd-cc-5.2.1:silvery-barbs', { access: dmOnlyAccess, label: 'Silvery Barbs' }],
        [
          'srd-cc-5.2.1:quarterstaff',
          { access: DEFAULT_CONTENT_CAMPAIGN_ACCESS, label: 'Quarterstaff' },
        ],
      ]),
      {
        heritageBySpeciesId: new Map([
          [
            'srd-cc-5.2.1:elf',
            new Map([['high-elf', { speciesId: 'srd-cc-5.2.1:elf', label: 'High Elf' }]]),
          ],
        ]),
      },
    )

    const result = resolveCharacterCampaignEligibility({
      subject: baseSubject,
      userId: 'user_1',
      campaignId: 'camp_1',
      startingLevel: 3,
      contentIndex,
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
