import { describe, expect, it } from 'vitest'

import type { Species } from '../../content/species'
import {
  characterMatchesOrganizationMemberSpeciesRecommendations,
  resolveOrganizationMemberSpeciesRecommendationIds,
  resolveOrganizationMemberSpeciesRecommendations,
} from './organization-member-species-recommendations'

function makeSpecies(slug: string, id = `srd-cc-5.2.1:${slug}`): Species {
  return {
    id,
    slug,
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    creatureType: 'humanoid',
    sizes: ['medium'],
    movement: { walk: 30 },
    traits: [],
  }
}

describe('resolveOrganizationMemberSpeciesRecommendations', () => {
  const dwarf = makeSpecies('dwarf')
  const elf = makeSpecies('elf')
  const halfling = makeSpecies('halfling')
  const available = [dwarf, elf]

  it('preserves stored order and drops unavailable ids', () => {
    expect(
      resolveOrganizationMemberSpeciesRecommendationIds({
        speciesAffinityIds: [halfling.id, elf.id, dwarf.id],
        playableSpecies: available,
      }),
    ).toEqual([elf.id, dwarf.id])

    expect(
      resolveOrganizationMemberSpeciesRecommendations({
        speciesAffinityIds: [halfling.id, elf.id, dwarf.id],
        playableSpecies: available,
      }).map((species) => species.id),
    ).toEqual([elf.id, dwarf.id])
  })
})

describe('characterMatchesOrganizationMemberSpeciesRecommendations', () => {
  const dwarf = makeSpecies('dwarf')
  const elf = makeSpecies('elf')
  const halfling = makeSpecies('halfling')

  it('matches when the character species id intersects surviving recommendations', () => {
    expect(
      characterMatchesOrganizationMemberSpeciesRecommendations({
        speciesId: halfling.id,
        speciesAffinityIds: [halfling.id, elf.id],
        playableSpecies: [dwarf, elf],
      }),
    ).toBe(false)

    expect(
      characterMatchesOrganizationMemberSpeciesRecommendations({
        speciesId: elf.id,
        speciesAffinityIds: [halfling.id, elf.id],
        playableSpecies: [dwarf, elf],
      }),
    ).toBe(true)
  })
})
