import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/fixtures/character-builder-fixtures'

import {
  applyQuickNpcRecommendedClassSeeding,
  resolveQuickNpcClassIdFromRecommendationCardinality,
  resolveQuickNpcClassRecommendationIds,
} from './quick-npc-class-recommendation.lib'
import {
  quickNpcMemberSetupValues,
  quickNpcMemberSetupWithNoTitle,
} from './quick-npc-test-fixtures'

describe('resolveQuickNpcClassIdFromRecommendationCardinality', () => {
  it('seeds exactly one recommendation', () => {
    expect(resolveQuickNpcClassIdFromRecommendationCardinality(['srd-cc-5.2.1:rogue'])).toBe(
      'srd-cc-5.2.1:rogue',
    )
  })

  it('leaves Class unresolved for zero recommendations', () => {
    expect(resolveQuickNpcClassIdFromRecommendationCardinality([])).toBe('')
  })

  it('leaves Class unresolved for multiple recommendations', () => {
    expect(
      resolveQuickNpcClassIdFromRecommendationCardinality([
        'srd-cc-5.2.1:rogue',
        'srd-cc-5.2.1:fighter',
      ]),
    ).toBe('')
  })
})

describe('resolveQuickNpcClassRecommendationIds', () => {
  const rogueClass = {
    ...populatedBuilderCatalog.classes[0]!,
    id: 'srd-cc-5.2.1:rogue',
    slug: 'rogue',
    name: 'Rogue',
  }
  const fighterClass = {
    ...populatedBuilderCatalog.classes[0]!,
    id: 'srd-cc-5.2.1:fighter',
    slug: 'fighter',
    name: 'Fighter',
  }
  const context = createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [fighterClass, rogueClass],
    },
  })
  const guildmasterTitle = {
    id: 'omt_guildmaster',
    label: 'Guildmaster',
    description: 'Head of the guild.',
    priority: 50 as const,
    npcRecommendation: { templateId: 'covert_operator' as const, level: 9 },
  } as const

  it('merges template and organization affinities for the current title', () => {
    expect(
      resolveQuickNpcClassRecommendationIds({
        values: quickNpcMemberSetupValues({
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: 'Guildmaster',
          classId: '',
          level: 9,
        }),
        context,
        titles: [guildmasterTitle],
        organizationClassAffinityIds: [fighterClass.id],
      }),
    ).toEqual([rogueClass.id, fighterClass.id])
  })

  it('falls back to organization affinities when the title has no template recommendation', () => {
    expect(
      resolveQuickNpcClassRecommendationIds({
        values: quickNpcMemberSetupWithNoTitle({
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: '',
          level: 1,
        }),
        context,
        titles: [guildmasterTitle],
        organizationClassAffinityIds: [rogueClass.id],
      }),
    ).toEqual([rogueClass.id])
  })
})

describe('applyQuickNpcRecommendedClassSeeding', () => {
  const rogueClass = {
    ...populatedBuilderCatalog.classes[0]!,
    id: 'srd-cc-5.2.1:rogue',
    slug: 'rogue',
    name: 'Rogue',
  }
  const fighterClass = {
    ...populatedBuilderCatalog.classes[0]!,
    id: 'srd-cc-5.2.1:fighter',
    slug: 'fighter',
    name: 'Fighter',
  }
  const context = createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [fighterClass, rogueClass],
    },
  })
  const guildmasterTitle = {
    id: 'omt_guildmaster',
    label: 'Guildmaster',
    description: 'Head of the guild.',
    priority: 50 as const,
    npcRecommendation: { templateId: 'covert_operator' as const, level: 9 },
  } as const

  it('auto-seeds a single eligible recommendation', () => {
    expect(
      applyQuickNpcRecommendedClassSeeding({
        values: quickNpcMemberSetupWithNoTitle({
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: '',
          level: 1,
        }),
        context,
        titles: [],
        organizationClassAffinityIds: [rogueClass.id],
      }),
    ).toMatchObject({ classId: rogueClass.id })
  })

  it('clears Class at level 0 regardless of recommendations', () => {
    expect(
      applyQuickNpcRecommendedClassSeeding({
        values: quickNpcMemberSetupValues({
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: 'Guildmaster',
          classId: rogueClass.id,
          level: 0,
        }),
        context,
        titles: [guildmasterTitle],
        organizationClassAffinityIds: [rogueClass.id],
      }),
    ).toMatchObject({ classId: '' })
  })

  it('does not auto-select when multiple recommendations exist', () => {
    expect(
      applyQuickNpcRecommendedClassSeeding({
        values: quickNpcMemberSetupValues({
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: 'Guildmaster',
          classId: '',
          level: 9,
        }),
        context,
        titles: [guildmasterTitle],
        organizationClassAffinityIds: [fighterClass.id],
      }),
    ).toMatchObject({ classId: '' })
  })
})
