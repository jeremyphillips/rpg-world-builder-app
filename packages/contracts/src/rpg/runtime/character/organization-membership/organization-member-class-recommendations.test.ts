import { describe, expect, it } from 'vitest'

import {
  characterMatchesOrganizationMemberClassRecommendations,
  resolveOrganizationMemberClassRecommendationIds,
  resolveOrganizationMemberClassRecommendations,
  resolveOrganizationNpcClassRecommendationIds,
} from './organization-member-class-recommendations'
import type { CharacterClass } from '../../../content/classes/class'

function makeClass(slug: string, id = `srd-cc-5.2.1:${slug}`): CharacterClass {
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
    primaryAbilities: ['str'],
    hitDie: 10,
    proficiencies: {
      savingThrows: ['str', 'con'],
      armor: { categories: [], items: [] },
      weapons: { categories: [], items: [] },
      skills: { categories: [], items: [] },
    },
    features: [],
  }
}

describe('resolveOrganizationMemberClassRecommendations', () => {
  const fighter = makeClass('fighter')
  const rogue = makeClass('rogue')
  const wizard = makeClass('wizard')
  const available = [fighter, rogue]

  it('preserves stored order and drops unavailable ids', () => {
    expect(
      resolveOrganizationMemberClassRecommendationIds({
        classAffinityIds: [wizard.id, rogue.id, fighter.id],
        playableClasses: available,
      }),
    ).toEqual([rogue.id, fighter.id])

    expect(
      resolveOrganizationMemberClassRecommendations({
        classAffinityIds: [wizard.id, rogue.id, fighter.id],
        playableClasses: available,
      }).map((characterClass) => characterClass.id),
    ).toEqual([rogue.id, fighter.id])
  })
})

describe('resolveOrganizationNpcClassRecommendationIds', () => {
  const fighter = makeClass('fighter')
  const rogue = makeClass('rogue')
  const wizard = makeClass('wizard')
  const paladin = makeClass('paladin')
  const playableClasses = [fighter, rogue, wizard, paladin]

  function ids(
    input: Parameters<typeof resolveOrganizationNpcClassRecommendationIds>[0],
  ): string[] {
    return resolveOrganizationNpcClassRecommendationIds(input).map((entry) => entry.id)
  }

  it('falls back to organization affinities when no template slugs are provided', () => {
    expect(
      ids({
        organizationClassAffinityIds: [wizard.id, rogue.id, fighter.id],
        playableClasses,
      }),
    ).toEqual([wizard.id, rogue.id, fighter.id])
  })

  it('falls back to template affinities when no organization affinities are provided', () => {
    expect(
      ids({
        templateClassAffinitySlugs: ['rogue', 'fighter'],
        playableClasses,
      }),
    ).toEqual([rogue.id, fighter.id])
  })

  it('returns an empty list when neither affinity source yields eligible classes', () => {
    expect(
      ids({
        templateClassAffinitySlugs: ['monk'],
        organizationClassAffinityIds: [makeClass('monk').id],
        playableClasses: [fighter],
      }),
    ).toEqual([])
  })

  it('ranks shared classes first, then template-only, then organization-only and keeps sources', () => {
    expect(
      resolveOrganizationNpcClassRecommendationIds({
        templateClassAffinitySlugs: ['fighter', 'rogue'],
        organizationClassAffinityIds: [rogue.id, wizard.id],
        playableClasses,
      }),
    ).toEqual([
      { id: rogue.id, sources: ['template', 'organization'] },
      { id: fighter.id, sources: ['template'] },
      { id: wizard.id, sources: ['organization'] },
    ])
  })

  it('tags a title override as title rather than template', () => {
    expect(
      resolveOrganizationNpcClassRecommendationIds({
        templateClassAffinitySlugs: ['fighter', 'paladin'],
        templateSource: 'title',
        organizationClassAffinityIds: [fighter.id],
        playableClasses,
      }),
    ).toEqual([
      { id: fighter.id, sources: ['title', 'organization'] },
      { id: paladin.id, sources: ['title'] },
    ])
  })

  it('dedupes recommendations and drops ineligible classes', () => {
    expect(
      ids({
        templateClassAffinitySlugs: ['rogue', 'rogue'],
        organizationClassAffinityIds: [rogue.id, wizard.id, makeClass('monk').id],
        playableClasses: [fighter, rogue, wizard],
      }),
    ).toEqual([rogue.id, wizard.id])
  })

  it('preserves template order within the template-only tier', () => {
    expect(
      ids({
        templateClassAffinitySlugs: ['paladin', 'fighter'],
        organizationClassAffinityIds: [],
        playableClasses,
      }),
    ).toEqual([paladin.id, fighter.id])
  })
})

describe('characterMatchesOrganizationMemberClassRecommendations', () => {
  const fighter = makeClass('fighter')
  const rogue = makeClass('rogue')
  const wizard = makeClass('wizard')

  it('matches when any character class id intersects surviving recommendations', () => {
    expect(
      characterMatchesOrganizationMemberClassRecommendations({
        classIds: [fighter.id, wizard.id],
        classAffinityIds: [wizard.id, rogue.id],
        playableClasses: [fighter, rogue],
      }),
    ).toBe(false)

    expect(
      characterMatchesOrganizationMemberClassRecommendations({
        classIds: [fighter.id, wizard.id],
        classAffinityIds: [rogue.id, fighter.id],
        playableClasses: [fighter, rogue],
      }),
    ).toBe(true)
  })
})
