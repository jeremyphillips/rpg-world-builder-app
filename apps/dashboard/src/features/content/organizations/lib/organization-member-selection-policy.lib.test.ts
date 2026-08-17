import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { createCampaignNpcBuilderContextFixture } from '@/features/character/lib/character-builder-fixtures'
import { makeCharacterClass } from '@/test/fixtures/factories/character-class'
import { makeSpecies } from '@/test/fixtures/factories/species'

import { buildOrganizationMemberSelectionPolicy } from './organization-member-selection-policy.lib'

describe('buildOrganizationMemberSelectionPolicy', () => {
  const fighter = makeCharacterClass({ id: 'class-fighter', slug: 'fighter', name: 'Fighter' })
  const human = makeSpecies({ id: 'species-human', slug: 'human', name: 'Human' })
  const feyPixie = makeSpecies({
    id: 'species-pixie',
    slug: 'pixie',
    name: 'Pixie',
    creatureType: 'fey',
  })
  const pcOnlySpecies = {
    ...makeSpecies({ id: 'species-pc-only', slug: 'pc-only', name: 'PC Only' }),
    campaignAccess: {
      ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      visibilityMode: 'specific_players',
      participantIds: ['char-a'],
      effectiveAudience: 'specific_players',
    },
  } as typeof human

  const npcContext = createCampaignNpcBuilderContextFixture({
    catalog: {
      species: [human, feyPixie, pcOnlySpecies],
      classes: [fighter],
      spells: [],
      equipment: [],
      skillProficiencies: [],
      organizations: [],
      languages: [],
    },
  })

  it('returns undefined when no affinities are configured', () => {
    expect(
      buildOrganizationMemberSelectionPolicy({
        memberClassAffinityIds: [],
        memberSpeciesAffinityIds: [],
        npcBuildContext: npcContext,
      }),
    ).toBeUndefined()
  })

  it('returns undefined while the NPC build context is unavailable', () => {
    expect(
      buildOrganizationMemberSelectionPolicy({
        memberClassAffinityIds: [fighter.id],
        memberSpeciesAffinityIds: [],
        npcBuildContext: undefined,
      }),
    ).toBeUndefined()
  })

  it('returns undefined when the NPC build context failed', () => {
    expect(
      buildOrganizationMemberSelectionPolicy({
        memberClassAffinityIds: [fighter.id],
        memberSpeciesAffinityIds: [],
        npcBuildContext: npcContext,
        buildContextFailed: true,
      }),
    ).toBeUndefined()
  })

  it('derives playable rows from resolvePlayableBuilderContent for NPC consumption', () => {
    expect(
      buildOrganizationMemberSelectionPolicy({
        memberClassAffinityIds: [fighter.id],
        memberSpeciesAffinityIds: [human.id],
        npcBuildContext: npcContext,
      }),
    ).toEqual({
      memberClassAffinityIds: [fighter.id],
      memberSpeciesAffinityIds: [human.id],
      playableClasses: [fighter],
      playableSpecies: [human],
    })
  })

  it('excludes species disallowed by creatureTypePolicy from the recommendation universe', () => {
    const policy = buildOrganizationMemberSelectionPolicy({
      memberClassAffinityIds: [],
      memberSpeciesAffinityIds: [feyPixie.id],
      npcBuildContext: npcContext,
    })

    expect(policy?.playableSpecies.map((species) => species.id)).toEqual([human.id])
  })

  it('excludes species that are not NPC-playable from the recommendation universe', () => {
    const policy = buildOrganizationMemberSelectionPolicy({
      memberClassAffinityIds: [],
      memberSpeciesAffinityIds: [pcOnlySpecies.id],
      npcBuildContext: npcContext,
    })

    expect(policy?.playableSpecies.map((species) => species.id)).toEqual([human.id])
  })
})
