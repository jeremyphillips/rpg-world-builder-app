import { describe, expect, it } from 'vitest'

import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../components/connections/organization-membership-title-field.types'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import {
  applyQuickNpcSetupValueChange,
  resolveQuickNpcLevelForMembershipTitle,
} from './quick-npc-setup-value-change.lib'
import { createQuickNpcSetupDefaultValues } from './quick-npc-form-fields'

const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

const guildmasterTitle = {
  id: 'omt_guildmaster',
  label: 'Guildmaster',
  description: 'Head of the guild.',
  priority: 50 as const,
  npcRecommendation: { templateId: 'civic_leader' as const, level: 8 },
} as const

const highLevelTitle = {
  ...guildmasterTitle,
  id: 'omt_archmage',
  label: 'Archmage',
  npcRecommendation: { templateId: 'arcane_practitioner' as const, level: 25 },
} as const

describe('resolveQuickNpcLevelForMembershipTitle', () => {
  it('returns the campaign default for no title', () => {
    expect(
      resolveQuickNpcLevelForMembershipTitle({
        membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
        titles: [guildmasterTitle],
        context,
      }),
    ).toBe(0)
  })

  it('seeds from the title recommendation when present', () => {
    expect(
      resolveQuickNpcLevelForMembershipTitle({
        membershipTitle: 'Guildmaster',
        titles: [guildmasterTitle],
        context,
      }),
    ).toBe(8)
  })

  it('clamps recommended level to the campaign maximum', () => {
    expect(
      resolveQuickNpcLevelForMembershipTitle({
        membershipTitle: 'Archmage',
        titles: [highLevelTitle],
        context,
      }),
    ).toBe(20)
  })
})

describe('applyQuickNpcSetupValueChange', () => {
  const baseValues = {
    ...createQuickNpcSetupDefaultValues(context),
    speciesId: 'srd-cc-5.2.1:dwarf',
    membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
    classId: 'srd-cc-5.2.1:fighter',
    level: 3,
  }

  it('clears class when species changes without touching level', () => {
    expect(
      applyQuickNpcSetupValueChange({
        values: baseValues,
        setId: 'speciesId',
        nextValue: 'srd-cc-5.2.1:elf',
        context,
        titles: [guildmasterTitle],
      }),
    ).toEqual({
      ...baseValues,
      speciesId: 'srd-cc-5.2.1:elf',
      classId: '',
      level: 3,
    })
  })

  it('reseeds level from title recommendation without clearing class until level side effects apply', () => {
    expect(
      applyQuickNpcSetupValueChange({
        values: baseValues,
        setId: 'membershipTitle',
        nextValue: 'Guildmaster',
        context,
        titles: [guildmasterTitle],
      }),
    ).toEqual({
      ...baseValues,
      membershipTitle: 'Guildmaster',
      level: 8,
    })
  })

  it('clears class when level drops to 0', () => {
    expect(
      applyQuickNpcSetupValueChange({
        values: baseValues,
        setId: 'level',
        nextValue: 0,
        context,
        titles: [guildmasterTitle],
      }),
    ).toEqual({
      ...baseValues,
      level: 0,
      classId: '',
    })
  })

  it('preserves class when level stays above 0', () => {
    expect(
      applyQuickNpcSetupValueChange({
        values: baseValues,
        setId: 'level',
        nextValue: 5,
        context,
        titles: [guildmasterTitle],
      }),
    ).toEqual({
      ...baseValues,
      level: 5,
    })
  })
})
