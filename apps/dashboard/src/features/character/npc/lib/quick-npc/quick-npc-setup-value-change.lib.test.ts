import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import {
  applyQuickNpcSetupValueChange,
  resolveQuickNpcLevelForMembershipTitle,
} from './quick-npc-setup-value-change.lib'
import {
  isQuickNpcOrganizationMemberSetup,
  type QuickNpcOrganizationMemberSetupValues,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import {
  quickNpcMemberSetupValues,
  quickNpcMemberSetupWithNoTitle,
} from './quick-npc-test-fixtures'

const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

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
const multiClassContext = createCampaignNpcBuilderContextFixture({
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
  npcRecommendation: { templateId: 'covert_operator' as const, level: 8 },
} as const

const martialCommanderTitle = {
  id: 'omt_commander',
  label: 'Commander',
  description: 'Field commander.',
  priority: 50 as const,
  npcRecommendation: { templateId: 'martial_commander' as const, level: 8 },
} as const

const highLevelTitle = {
  ...guildmasterTitle,
  id: 'omt_archmage',
  label: 'Archmage',
  npcRecommendation: { templateId: 'arcane_practitioner' as const, level: 25 },
} as const

const changeArgs = {
  context: multiClassContext,
  titles: [guildmasterTitle, martialCommanderTitle],
  organizationClassAffinityIds: [rogueClass.id],
}

function applySetupChange(
  args: {
    values: QuickNpcSetupValues
    setId: string
    nextValue: string | number
  } & typeof changeArgs,
) {
  const { values, setId, nextValue, ...rest } = args
  const previousValue =
    setId === 'speciesId'
      ? values.speciesId
      : setId === 'membershipTitle'
        ? isQuickNpcOrganizationMemberSetup(values)
          ? (values.membershipTitle ?? '')
          : ''
        : setId === 'classId'
          ? values.classId
          : values.level

  return applyQuickNpcSetupValueChange({
    values,
    event: { setId, previousValue, nextValue, invalidatedSetIds: [] },
    ...rest,
  })
}

describe('resolveQuickNpcLevelForMembershipTitle', () => {
  it('returns the campaign default for no title', () => {
    expect(
      resolveQuickNpcLevelForMembershipTitle({
        membershipTitle: 'omt_member',
        titles: [guildmasterTitle],
        context,
      }),
    ).toBe(0)
  })

  it('seeds from the title recommendation when present', () => {
    expect(
      resolveQuickNpcLevelForMembershipTitle({
        membershipTitle: 'omt_guildmaster',
        titles: [guildmasterTitle],
        context,
      }),
    ).toBe(8)
  })

  it('clamps recommended level to the campaign maximum', () => {
    expect(
      resolveQuickNpcLevelForMembershipTitle({
        membershipTitle: 'omt_archmage',
        titles: [highLevelTitle],
        context,
      }),
    ).toBe(20)
  })
})

describe('applyQuickNpcSetupValueChange', () => {
  const baseValues: QuickNpcOrganizationMemberSetupValues = quickNpcMemberSetupValues({
    speciesId: 'srd-cc-5.2.1:dwarf',
    membershipTitle: 'omt_member',
    classId: fighterClass.id,
    level: 3,
  })

  it('recomputes and auto-seeds Class when Species changes without touching level', () => {
    expect(
      applySetupChange({
        values: baseValues,
        setId: 'speciesId',
        nextValue: 'srd-cc-5.2.1:elf',
        ...changeArgs,
      }),
    ).toEqual({
      ...baseValues,
      speciesId: 'srd-cc-5.2.1:elf',
      classId: rogueClass.id,
      level: 3,
    })
  })

  it('defers Class seeding when Title is selected before Species', () => {
    expect(
      applySetupChange({
        values: quickNpcMemberSetupValues({
          speciesId: '',
          membershipTitle: undefined,
          classId: '',
        }),
        setId: 'membershipTitle',
        nextValue: 'omt_guildmaster',
        ...changeArgs,
      }),
    ).toEqual(
      quickNpcMemberSetupValues({
        speciesId: '',
        membershipTitle: 'omt_guildmaster',
        classId: '',
        level: 8,
      }),
    )
  })

  it('auto-seeds Class when Species completes after Title', () => {
    expect(
      applySetupChange({
        values: quickNpcMemberSetupValues({
          speciesId: '',
          membershipTitle: 'omt_guildmaster',
          classId: '',
          level: 8,
        }),
        setId: 'speciesId',
        nextValue: 'srd-cc-5.2.1:elf',
        ...changeArgs,
      }),
    ).toEqual(
      quickNpcMemberSetupValues({
        speciesId: 'srd-cc-5.2.1:elf',
        membershipTitle: 'omt_guildmaster',
        classId: rogueClass.id,
        level: 8,
      }),
    )
  })

  it('preserves species when title changes and reseeds level and class', () => {
    expect(
      applySetupChange({
        values: quickNpcMemberSetupWithNoTitle({
          speciesId: 'srd-cc-5.2.1:elf',
        }),
        setId: 'membershipTitle',
        nextValue: 'omt_guildmaster',
        ...changeArgs,
      }),
    ).toEqual({
      ...baseValues,
      speciesId: 'srd-cc-5.2.1:elf',
      membershipTitle: 'omt_guildmaster',
      level: 8,
      classId: rogueClass.id,
    })
  })

  it('auto-seeds Class when Title resolves to exactly one recommendation', () => {
    expect(
      applySetupChange({
        values: baseValues,
        setId: 'membershipTitle',
        nextValue: 'omt_guildmaster',
        ...changeArgs,
      }),
    ).toEqual({
      ...baseValues,
      membershipTitle: 'omt_guildmaster',
      level: 8,
      classId: rogueClass.id,
    })
  })

  it('clears Class when Title resolves to multiple recommendations', () => {
    expect(
      applySetupChange({
        values: quickNpcMemberSetupValues({
          ...baseValues,
          membershipTitle: 'omt_guildmaster',
          classId: rogueClass.id,
        }),
        setId: 'membershipTitle',
        nextValue: 'omt_commander',
        ...changeArgs,
      }),
    ).toEqual({
      ...baseValues,
      membershipTitle: 'omt_commander',
      level: 8,
      classId: '',
    })
  })

  it('seeds organization-only recommendations when the title has no template recommendation', () => {
    expect(
      applySetupChange({
        values: baseValues,
        setId: 'membershipTitle',
        nextValue: 'omt_member',
        ...changeArgs,
      }),
    ).toEqual({
      ...baseValues,
      membershipTitle: 'omt_member',
      level: 0,
      classId: '',
    })
  })

  it('clears class when level drops to 0', () => {
    expect(
      applySetupChange({
        values: baseValues,
        setId: 'level',
        nextValue: 0,
        ...changeArgs,
      }),
    ).toEqual({
      ...baseValues,
      level: 0,
      classId: '',
    })
  })

  it('preserves class when level stays above 0', () => {
    expect(
      applySetupChange({
        values: baseValues,
        setId: 'level',
        nextValue: 5,
        ...changeArgs,
      }),
    ).toEqual({
      ...baseValues,
      level: 5,
    })
  })

  it('recomputes and auto-seeds Class when level rises from 0 to a class-applicable level', () => {
    expect(
      applySetupChange({
        values: quickNpcMemberSetupWithNoTitle({
          speciesId: 'srd-cc-5.2.1:dwarf',
          level: 0,
          classId: '',
        }),
        setId: 'level',
        nextValue: 1,
        ...changeArgs,
      }),
    ).toEqual({
      ...baseValues,
      membershipTitle: 'omt_guildmaster',
      level: 1,
      classId: rogueClass.id,
    })
  })

  it('defers Class seeding when level rises from 0 before Species is complete', () => {
    expect(
      applySetupChange({
        values: quickNpcMemberSetupWithNoTitle({
          speciesId: '',
          level: 0,
          classId: '',
        }),
        setId: 'level',
        nextValue: 1,
        ...changeArgs,
      }),
    ).toEqual(
      quickNpcMemberSetupWithNoTitle({
        speciesId: '',
        level: 1,
        classId: '',
      }),
    )
  })

  it('does not restore a stale class when level rises from 0 without a single recommendation', () => {
    expect(
      applySetupChange({
        values: quickNpcMemberSetupValues({
          speciesId: baseValues.speciesId,
          membershipTitle: 'omt_commander',
          classId: '',
          level: 0,
        }),
        setId: 'level',
        nextValue: 8,
        ...changeArgs,
      }),
    ).toEqual({
      ...baseValues,
      membershipTitle: 'omt_commander',
      level: 8,
      classId: '',
    })
  })

  it('preserves a manually selected class', () => {
    expect(
      applySetupChange({
        values: baseValues,
        setId: 'classId',
        nextValue: fighterClass.id,
        ...changeArgs,
      }),
    ).toEqual({
      ...baseValues,
      classId: fighterClass.id,
    })
  })
})
