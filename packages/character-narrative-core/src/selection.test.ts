import { describe, expect, it } from 'vitest'

import type {
  NarrativeFragment,
  NarrativeGenerationContext,
} from '@rpg/contracts/character-narrative'

import { isFragmentEligible } from './selection'

const baseContext: NarrativeGenerationContext = {
  characterKind: 'npc',
  level: 1,
  affinities: [],
  tokens: { 'organization.name': 'Lantern Guild' },
  organizations: [],
  residences: [],
  people: [],
  places: [],
  boundConditions: ['organizationMembership.current'],
  omittedReferenceIds: [],
}

const fragment: NarrativeFragment = {
  id: 'org-bond',
  slot: 'bonds',
  text: 'I want to make a place for myself in {{organization.name}}.',
  themeIds: ['belonging'],
  requires: ['organization.name'],
  conditions: ['organizationMembership.current'],
  affinities: [],
  conflictTags: [],
  weight: 1,
  fallback: false,
}

describe('isFragmentEligible', () => {
  it('requires semantic conditions in addition to tokens', () => {
    expect(isFragmentEligible(fragment, baseContext, 'belonging')).toBe(true)
    expect(
      isFragmentEligible(
        fragment,
        { ...baseContext, boundConditions: ['organizationMembership.former'] },
        'belonging',
      ),
    ).toBe(false)
  })
})
