import { describe, expect, it } from 'vitest'

import { ORGANIZATION_AUTHORING_PRESET_IDS } from './authoring-preset'
import {
  ORGANIZATION_PRESET_MEMBER_CLASS_AFFINITIES,
  resolveOrganizationPresetMemberClassAffinityIds,
} from './preset-member-class-affinities'
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

describe('ORGANIZATION_PRESET_MEMBER_CLASS_AFFINITIES', () => {
  it('maps only known familiar types', () => {
    for (const presetId of Object.keys(ORGANIZATION_PRESET_MEMBER_CLASS_AFFINITIES)) {
      expect(ORGANIZATION_AUTHORING_PRESET_IDS).toContain(presetId)
    }
    expect(Object.keys(ORGANIZATION_PRESET_MEMBER_CLASS_AFFINITIES)).toHaveLength(20)
  })
})

describe('resolveOrganizationPresetMemberClassAffinityIds', () => {
  const discoverable = [
    makeClass('fighter'),
    makeClass('rogue'),
    makeClass('ranger'),
    makeClass('barbarian'),
  ]

  it('resolves slugs to ids in preset order and skips unavailable slugs', () => {
    expect(
      resolveOrganizationPresetMemberClassAffinityIds('mercenary_company', discoverable),
    ).toEqual(['srd-cc-5.2.1:fighter', 'srd-cc-5.2.1:barbarian', 'srd-cc-5.2.1:ranger'])
  })

  it('returns an empty list for presets without affinity seeds', () => {
    expect(resolveOrganizationPresetMemberClassAffinityIds('bank', discoverable)).toEqual([])
  })

  it('matches preset slugs only by exact slug on discoverable rows', () => {
    const customSlugMatch = makeClass('street-rogue', 'homebrew-street-rogue')
    expect(
      resolveOrganizationPresetMemberClassAffinityIds('thieves_guild', [customSlugMatch]),
    ).toEqual([])
  })
})
