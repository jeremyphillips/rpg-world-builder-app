import { describe, expect, it } from 'vitest'

import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../components/connections/organization-membership-title-field.types'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import {
  buildQuickNpcCreateSetupSets,
  formatQuickNpcSetupCharacterSummary,
  resolveQuickNpcSetupModel,
} from './quick-npc-create-modal-setup.lib'
import {
  QUICK_NPC_BUILD_FIELD_LABEL,
  QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL,
  resolveQuickNpcBuildCardModel,
} from './quick-npc-build-card.lib'
import {
  createQuickNpcSetupDefaultValues,
  isQuickNpcMembershipTitleSetupComplete,
} from './quick-npc-form-fields'
import { resolveQuickNpcClassOptionGroups } from './quick-npc-class-option-groups.lib'
import { resolveCreateSetupActiveSetId, resolveCreateSetupVisibleSetIds } from '@/lib/create-setup'

const guildmasterTitle = {
  id: 'omt_guildmaster',
  label: 'Guildmaster',
  description: 'Head of the guild.',
  priority: 50 as const,
  npcRecommendation: { templateId: 'covert_operator' as const, level: 5 },
} as const

describe('buildQuickNpcCreateSetupSets', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

  it('returns only title and species setup sets', () => {
    const values = createQuickNpcSetupDefaultValues(context)
    const sets = buildQuickNpcCreateSetupSets({
      context,
      values,
      onApplySetupChange: () => {},
      titles: [],
    })

    expect(sets.map((set) => set.id)).toEqual(['membershipTitle', 'speciesId'])
    expect(sets.find((set) => set.id === 'speciesId')?.collapseWhenActiveAndComplete).toBe(true)
    expect(isQuickNpcMembershipTitleSetupComplete(values.membershipTitle)).toBe(false)

    const sequenceItems = sets.map((set) => ({
      id: set.id,
      isComplete: set.isComplete,
      required: set.required,
      visibleWhenComplete: set.visibleWhenComplete,
    }))
    const activeSetId = resolveCreateSetupActiveSetId({ sets: sequenceItems })
    expect(activeSetId).toBe('membershipTitle')
    expect(resolveCreateSetupVisibleSetIds({ sets: sequenceItems, activeSetId })).toEqual([
      'membershipTitle',
    ])
  })

  it('reveals species after explicit No title without downstream setup sets', () => {
    const values = {
      ...createQuickNpcSetupDefaultValues(context),
      membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
    }
    const sets = buildQuickNpcCreateSetupSets({
      context,
      values,
      onApplySetupChange: () => {},
      titles: [],
    })

    expect(sets.map((set) => set.id)).toEqual(['membershipTitle', 'speciesId'])
    expect(sets.find((set) => set.id === 'membershipTitle')?.isComplete).toBe(true)

    const sequenceItems = sets.map((set) => ({
      id: set.id,
      isComplete: set.isComplete,
      required: set.required,
      visibleWhenComplete: set.visibleWhenComplete,
    }))
    const activeSetId = resolveCreateSetupActiveSetId({ sets: sequenceItems })
    expect(activeSetId).toBe('speciesId')
  })
})

describe('resolveQuickNpcBuildCardModel', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })
  const rogueClass = {
    ...populatedBuilderCatalog.classes[0]!,
    id: 'srd-cc-5.2.1:rogue',
    slug: 'rogue',
    name: 'Rogue',
  }
  const multiClassContext = createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [populatedBuilderCatalog.classes[0]!, rogueClass],
    },
  })

  it('returns null until title and species are complete', () => {
    expect(
      resolveQuickNpcBuildCardModel({
        context,
        values: createQuickNpcSetupDefaultValues(context),
        titles: [],
      }),
    ).toBeNull()
  })

  it('returns recommended build mode with class grouping and level prompt', () => {
    const model = resolveQuickNpcBuildCardModel({
      context: multiClassContext,
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: '',
        level: 5,
      },
      titles: [guildmasterTitle],
      members: { classAffinityIds: [rogueClass.id] },
    })

    expect(model).toMatchObject({
      mode: 'recommended',
      sectionEyebrow: QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL,
      templateLabel: 'Covert operator',
      level: 5,
      levelPrompt: 'Recommended for Guildmaster: Level 5.',
      classProgressionApplicable: true,
    })
    expect(model?.classOptionGroups.optionGroups?.[0]?.options).toEqual([
      { value: rogueClass.id, label: 'Rogue' },
    ])
  })

  it('returns build mode without template identity or recommended level helper', () => {
    const model = resolveQuickNpcBuildCardModel({
      context,
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
        classId: '',
        level: 0,
      },
      titles: [],
    })

    expect(model).toMatchObject({
      mode: 'build',
      sectionEyebrow: QUICK_NPC_BUILD_FIELD_LABEL,
      level: 0,
      classProgressionApplicable: false,
    })
    expect(model?.templateLabel).toBeUndefined()
    expect(model?.levelPrompt).toBeUndefined()
  })

  it('merges title template and organization class affinities for class recommendations', () => {
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

    const model = resolveQuickNpcBuildCardModel({
      context: multiClassContext,
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: '',
        level: 5,
      },
      titles: [guildmasterTitle],
      members: { classAffinityIds: [fighterClass.id] },
    })

    expect(model?.classOptionGroups.optionGroups).toEqual(
      resolveQuickNpcClassOptionGroups({
        classOptions: model!.classOptionGroups.options,
        recommendedClassIds: model!.recommendedClassIds,
        playableClasses: multiClassContext.catalog.classes,
      }).optionGroups,
    )
  })
})

describe('formatQuickNpcSetupCharacterSummary', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

  it('appends membership title and recommended build label after the character summary', () => {
    const summary = formatQuickNpcSetupCharacterSummary(
      {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: populatedBuilderCatalog.classes[0]!.id,
        level: 5,
      },
      context,
      [guildmasterTitle],
    )

    expect(summary).toContain('Dwarf')
    expect(summary).toContain('Guildmaster')
    expect(summary).toContain('Covert operator')
  })

  it('omits title segments when No title was chosen', () => {
    const summary = formatQuickNpcSetupCharacterSummary(
      {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
        classId: populatedBuilderCatalog.classes[0]!.id,
        level: 1,
      },
      context,
      [guildmasterTitle],
    )

    expect(summary).toContain('Dwarf')
    expect(summary).not.toContain('Guildmaster')
    expect(summary).not.toContain('Covert operator')
  })
})

describe('resolveQuickNpcSetupModel', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })
  const rogueClass = {
    ...populatedBuilderCatalog.classes[0]!,
    id: 'srd-cc-5.2.1:rogue',
    slug: 'rogue',
    name: 'Rogue',
  }
  const multiClassContext = createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [populatedBuilderCatalog.classes[0]!, rogueClass],
    },
  })

  it('requires class when level progression applies', () => {
    expect(
      resolveQuickNpcSetupModel({
        context,
        values: {
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
          classId: '',
          level: 1,
        },
      }).canContinue,
    ).toBe(false)
  })

  it('enables Continue when a single recommendation has been auto-seeded', () => {
    expect(
      resolveQuickNpcSetupModel({
        context: multiClassContext,
        values: {
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: 'Guildmaster',
          classId: rogueClass.id,
          level: 5,
        },
        titles: [guildmasterTitle],
        members: { classAffinityIds: [rogueClass.id] },
      }).canContinue,
    ).toBe(true)
  })
})
