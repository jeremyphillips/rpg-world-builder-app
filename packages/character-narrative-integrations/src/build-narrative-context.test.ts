import {
  createEmptyCharacterBuilderDraft,
  DEFAULT_ABILITY_GENERATION_RULES,
  defaultCampaignMechanicsPatch,
  resolveCharacterCreationPatch,
  type CampaignNpcBuildContext,
  type Location,
  type Organization,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { buildNarrativeContext } from './build-narrative-context'

const TEST_CAMPAIGN_ID = 'camp_1'
const TEST_RULESET_ID = 'srd-cc-5.2.1'

const lanternGuild = {
  id: 'organization-lantern-guild',
  slug: 'lantern-guild',
  rulesetId: TEST_RULESET_ID,
  source: 'homebrew',
  status: 'published',
  campaignId: TEST_CAMPAIGN_ID,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Lantern Guild',
  description: '<p>Guides and cartographers.</p>',
  organizationDomain: 'occupational',
  functions: [],
  practices: [],
  members: {
    classAffinityIds: [],
    speciesAffinityIds: [],
    titles: [],
  },
  connections: { locations: [] },
} satisfies Organization

const harborfordSettlement = {
  id: 'location-harborford',
  slug: 'harborford',
  rulesetId: TEST_RULESET_ID,
  source: 'homebrew',
  status: 'published',
  campaignId: TEST_CAMPAIGN_ID,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Harborford',
  kind: 'settlement',
  settlementType: 'city',
} satisfies Location

const greyshoreRegion = {
  id: 'location-greyshore',
  slug: 'greyshore',
  rulesetId: TEST_RULESET_ID,
  source: 'homebrew',
  status: 'published',
  campaignId: TEST_CAMPAIGN_ID,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Greyshore',
  kind: 'region',
  classification: { kind: 'geographic', type: 'coast' },
} satisfies Location

function createCampaignNpcContext(
  organizations: Organization[] = [lanternGuild],
): CampaignNpcBuildContext {
  return {
    channel: 'build',
    surface: 'dashboard',
    characterKind: 'npc',
    mode: 'dashboard',
    scope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: TEST_RULESET_ID },
    rulesScope: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID, rulesetId: TEST_RULESET_ID },
    ownershipTarget: { type: 'campaign', campaignId: TEST_CAMPAIGN_ID },
    acquisition: { kind: 'campaign_npc', campaignId: TEST_CAMPAIGN_ID },
    playActor: { kind: 'npc' },
    rulesetId: TEST_RULESET_ID,
    catalog: {
      species: [],
      classes: [],
      spells: [],
      equipment: [],
      skillProficiencies: [],
      organizations,
      languages: [],
    },
    characterCreationRules: {
      ...resolveCharacterCreationPatch(undefined, {
        name: 'Standard starting wealth',
        scope: { kind: 'standard' },
        tiers: [],
      }),
      abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
      armorClass: defaultCampaignMechanicsPatch().armorClass,
    },
    spellcastingProgression: {
      byClassSlug: new Map(),
      slotProgressions: new Map(),
    },
    permissions: { canCreateCharacter: true },
  } as unknown as CampaignNpcBuildContext
}

describe('buildNarrativeContext', () => {
  it('includes playable organizations and omits unavailable ones', () => {
    const context = createCampaignNpcContext()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      relationshipEdges: [
        {
          id: 'edge-lantern-guild',
          kind: 'organizationMembership' as const,
          characterId: '__new_character__',
          organizationId: lanternGuild.id,
          details: { lifecycle: 'current' as const, title: 'Guildmaster' },
        },
        {
          id: 'edge-missing-org',
          kind: 'organizationMembership' as const,
          characterId: '__new_character__',
          organizationId: 'organization-missing',
        },
      ],
    }

    const result = buildNarrativeContext({ draft, context, locations: [] })

    expect(result.organizations).toEqual([
      expect.objectContaining({
        id: lanternGuild.id,
        name: 'Lantern Guild',
        title: 'Guildmaster',
        lifecycle: 'current',
        provenance: { source: 'draft', draftEdgeId: 'edge-lantern-guild' },
      }),
    ])
    expect(result.omittedReferenceIds).toEqual(['organization-missing'])
  })

  it('includes eligible resides_at locations and omits ineligible or missing ones', () => {
    const context = createCampaignNpcContext()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      relationshipEdges: [
        {
          id: 'conn-1',
          kind: 'resides_at' as const,
          characterId: '__new_character__',
          locationId: harborfordSettlement.id,
        },
        {
          id: 'conn-2',
          kind: 'resides_at' as const,
          characterId: '__new_character__',
          locationId: greyshoreRegion.id,
        },
        {
          id: 'conn-3',
          kind: 'resides_at' as const,
          characterId: '__new_character__',
          locationId: 'location-missing',
        },
        {
          id: 'conn-4',
          kind: 'owns' as const,
          characterId: '__new_character__',
          locationId: harborfordSettlement.id,
        },
      ],
    }

    const result = buildNarrativeContext({
      draft,
      context,
      locations: [harborfordSettlement, greyshoreRegion],
    })

    expect(result.residences).toEqual([
      expect.objectContaining({
        id: harborfordSettlement.id,
        name: 'Harborford',
        role: 'residence',
        provenance: { source: 'draft', draftEdgeId: 'conn-1' },
      }),
    ])
    expect(result.omittedReferenceIds).toEqual([greyshoreRegion.id, 'location-missing'])
  })

  it('projects person and place relationship facts from draft edges', () => {
    const context = createCampaignNpcContext()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      relationshipEdges: [
        {
          id: 'edge-home',
          kind: 'hometown' as const,
          characterId: '__new_character__',
          locationId: harborfordSettlement.id,
        },
        {
          id: 'edge-mentor',
          kind: 'mentorOf' as const,
          characterId: 'char-mentor',
          relatedCharacterId: '__new_character__',
        },
        {
          id: 'edge-child',
          kind: 'parentOf' as const,
          characterId: '__new_character__',
          relatedCharacterId: 'char-child',
        },
      ],
    }

    const result = buildNarrativeContext({
      draft,
      context,
      locations: [harborfordSettlement],
      characters: [
        { id: 'char-mentor', name: 'Seraphina Vale' },
        { id: 'char-child', name: 'Darius Vale' },
      ],
    })

    expect(result.places).toEqual([
      expect.objectContaining({
        id: harborfordSettlement.id,
        name: 'Harborford',
        role: 'hometown',
      }),
    ])
    expect(result.people).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'char-mentor', role: 'mentor', name: 'Seraphina Vale' }),
        expect.objectContaining({ id: 'char-child', role: 'child', name: 'Darius Vale' }),
      ]),
    )
    expect(result.relationshipFacts?.people).toHaveLength(2)
  })

  it('omits class tokens for classless and npc drafts', () => {
    const context = createCampaignNpcContext()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 0 },
    }

    const result = buildNarrativeContext({ draft, context, locations: [] })

    expect(result.characterKind).toBe('npc')
    expect(result.tokens['class.name']).toBeUndefined()
    expect(result.level).toBe(0)
  })
})
