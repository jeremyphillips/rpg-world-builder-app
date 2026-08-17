import { describe, expect, it } from 'vitest'

import {
  characterMatchesOrganizationMemberClassRecommendations,
  resolveOrganizationMemberClassRecommendationIds,
  resolveOrganizationMemberClassRecommendations,
} from './organization-member-class-recommendations'
import type { CharacterClass } from '../../content/classes/class'

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
        memberClassAffinityIds: [wizard.id, rogue.id, fighter.id],
        playableClasses: available,
      }),
    ).toEqual([rogue.id, fighter.id])

    expect(
      resolveOrganizationMemberClassRecommendations({
        memberClassAffinityIds: [wizard.id, rogue.id, fighter.id],
        playableClasses: available,
      }).map((characterClass) => characterClass.id),
    ).toEqual([rogue.id, fighter.id])
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
        memberClassAffinityIds: [wizard.id, rogue.id],
        playableClasses: [fighter, rogue],
      }),
    ).toBe(false)

    expect(
      characterMatchesOrganizationMemberClassRecommendations({
        classIds: [fighter.id, wizard.id],
        memberClassAffinityIds: [rogue.id, fighter.id],
        playableClasses: [fighter, rogue],
      }),
    ).toBe(true)
  })
})
