import { describe, expect, it } from 'vitest'

import { makeCharacterClass } from '@/test/fixtures/factories/character-class'
import { pickSpecies } from '@/test/fixtures/pick'

import {
  buildOrganizationMemberSelectionPolicy,
  resolveOrganizationMemberSelectionPolicyPending,
} from './organization-member-selection-policy.lib'

describe('resolveOrganizationMemberSelectionPolicyPending', () => {
  it('waits only for the affinity catalogs that are configured', () => {
    expect(
      resolveOrganizationMemberSelectionPolicyPending({
        memberClassAffinityIds: ['class-rogue'],
        memberSpeciesAffinityIds: [],
        classesPending: true,
        speciesPending: false,
      }),
    ).toBe(true)

    expect(
      resolveOrganizationMemberSelectionPolicyPending({
        memberClassAffinityIds: [],
        memberSpeciesAffinityIds: ['species-elf'],
        classesPending: true,
        speciesPending: true,
      }),
    ).toBe(true)

    expect(
      resolveOrganizationMemberSelectionPolicyPending({
        memberClassAffinityIds: [],
        memberSpeciesAffinityIds: [],
        classesPending: true,
        speciesPending: true,
      }),
    ).toBe(false)
  })
})

describe('buildOrganizationMemberSelectionPolicy', () => {
  const fighter = makeCharacterClass({ id: 'class-fighter', slug: 'fighter', name: 'Fighter' })
  const human = pickSpecies('human')

  it('returns undefined when no affinities are configured', () => {
    expect(
      buildOrganizationMemberSelectionPolicy({
        memberClassAffinityIds: [],
        memberSpeciesAffinityIds: [],
        classes: [fighter],
        species: [human],
      }),
    ).toBeUndefined()
  })

  it('filters playable classes and species for npc consumption', () => {
    expect(
      buildOrganizationMemberSelectionPolicy({
        memberClassAffinityIds: [fighter.id],
        memberSpeciesAffinityIds: [human.id],
        classes: [fighter],
        species: [human],
      }),
    ).toEqual({
      memberClassAffinityIds: [fighter.id],
      memberSpeciesAffinityIds: [human.id],
      playableClasses: [fighter],
      playableSpecies: [human],
    })
  })
})
