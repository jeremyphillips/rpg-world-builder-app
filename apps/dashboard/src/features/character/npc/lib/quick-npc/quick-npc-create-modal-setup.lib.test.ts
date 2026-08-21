import { describe, expect, it } from 'vitest'

import { makeSpecies } from '@/test/fixtures/factories/species'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import {
  buildQuickNpcCreateSetupSets,
  resolveQuickNpcSetupSummaryRows,
  isQuickNpcBuildResolved,
  quickNpcBuildRevision,
  resolveQuickNpcBuildExternalDecision,
  QUICK_NPC_BUILD_EXTERNAL_DECISION_ID,
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
import {
  quickNpcMemberSetupValues,
  quickNpcMemberSetupWithNoTitle,
  quickNpcOrganizationMemberCreateContext,
  quickNpcStandaloneCreateContext,
  quickNpcStandaloneSetupValues,
} from './quick-npc-test-fixtures'

const memberCreateContext = quickNpcOrganizationMemberCreateContext()
const standaloneCreateContext = quickNpcStandaloneCreateContext()

const guildmasterTitle = {
  id: 'omt_guildmaster',
  label: 'Guildmaster',
  description: 'Head of the guild.',
  priority: 50 as const,
  npcRecommendation: { templateId: 'covert_operator' as const, level: 5 },
} as const

describe('buildQuickNpcCreateSetupSets', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

  it('returns only title and species setup sets for organization-member context', () => {
    const values = createQuickNpcSetupDefaultValues(context, memberCreateContext)
    const sets = buildQuickNpcCreateSetupSets({
      createContext: memberCreateContext,
      context,
      values,
      titles: [],
    })

    expect(sets.map((set) => set.id)).toEqual(['membershipTitle', 'speciesId'])
    expect(sets.find((set) => set.id === 'membershipTitle')?.summaryGroup).toBe('selections')
    expect(
      isQuickNpcMembershipTitleSetupComplete(
        values.contextKind === 'organization-member' ? values.membershipTitle : undefined,
      ),
    ).toBe(false)

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

  it('returns only species setup set for standalone context', () => {
    const values = createQuickNpcSetupDefaultValues(context, standaloneCreateContext)
    const sets = buildQuickNpcCreateSetupSets({
      createContext: standaloneCreateContext,
      context,
      values,
      titles: [],
    })

    expect(sets.map((set) => set.id)).toEqual(['speciesId'])
    expect(sets.find((set) => set.id === 'speciesId')?.visibleWhenComplete).toBeUndefined()
  })

  it('reveals species after explicit No title without downstream setup sets', () => {
    const values = quickNpcMemberSetupWithNoTitle()
    const sets = buildQuickNpcCreateSetupSets({
      createContext: memberCreateContext,
      context,
      values,
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

  it('returns null until title and species are complete for organization-member context', () => {
    expect(
      resolveQuickNpcBuildCardModel({
        createContext: memberCreateContext,
        context,
        values: createQuickNpcSetupDefaultValues(context, memberCreateContext),
        titles: [],
      }),
    ).toBeNull()
  })

  it('returns build card after species is complete for standalone context', () => {
    const model = resolveQuickNpcBuildCardModel({
      createContext: standaloneCreateContext,
      context,
      values: quickNpcStandaloneSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        level: 0,
      }),
      titles: [],
    })

    expect(model).toMatchObject({
      mode: 'build',
      sectionEyebrow: QUICK_NPC_BUILD_FIELD_LABEL,
      level: 0,
      classProgressionApplicable: false,
    })
  })

  it('returns recommended build mode with class grouping and level prompt', () => {
    const model = resolveQuickNpcBuildCardModel({
      createContext: memberCreateContext,
      context: multiClassContext,
      values: quickNpcMemberSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: '',
        level: 5,
      }),
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
      createContext: memberCreateContext,
      context,
      values: quickNpcMemberSetupWithNoTitle({
        speciesId: 'srd-cc-5.2.1:dwarf',
        classId: '',
        level: 0,
      }),
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
      createContext: memberCreateContext,
      context: multiClassContext,
      values: quickNpcMemberSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: '',
        level: 5,
      }),
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

describe('resolveQuickNpcSetupSummaryRows', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

  it('returns Role, Species, and Build rows with explicit edit targets when a title recommendation exists', () => {
    const rows = resolveQuickNpcSetupSummaryRows({
      createContext: memberCreateContext,
      values: quickNpcMemberSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: populatedBuilderCatalog.classes[0]!.id,
        level: 5,
      }),
      context,
      titles: [guildmasterTitle],
    })

    expect(rows).toEqual([
      {
        id: 'membershipTitle',
        label: 'Role',
        value: 'Guildmaster',
        editTarget: { type: 'set', id: 'membershipTitle' },
      },
      {
        id: 'speciesId',
        label: 'Species',
        value: 'Dwarf',
        editTarget: { type: 'set', id: 'speciesId' },
      },
      {
        id: 'quickNpcBuild',
        label: 'Build',
        value: 'Covert operator · Level 5 Fighter',
        editTarget: { type: 'external', id: 'quickNpcBuild' },
      },
    ])
  })

  it('omits Role row for standalone context', () => {
    const rows = resolveQuickNpcSetupSummaryRows({
      createContext: standaloneCreateContext,
      values: quickNpcStandaloneSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        classId: populatedBuilderCatalog.classes[0]!.id,
        level: 1,
      }),
      context,
      titles: [],
    })

    expect(rows.map((row) => row.id)).toEqual(['speciesId', 'quickNpcBuild'])
  })

  it('includes Build with level-only copy when no title recommendation exists', () => {
    const rows = resolveQuickNpcSetupSummaryRows({
      createContext: memberCreateContext,
      values: quickNpcMemberSetupWithNoTitle({
        speciesId: 'srd-cc-5.2.1:dwarf',
        classId: populatedBuilderCatalog.classes[0]!.id,
        level: 1,
      }),
      context,
      titles: [guildmasterTitle],
    })

    expect(rows).toEqual([
      {
        id: 'membershipTitle',
        label: 'Role',
        value: 'No title',
        editTarget: { type: 'set', id: 'membershipTitle' },
      },
      {
        id: 'speciesId',
        label: 'Species',
        value: 'Dwarf',
        editTarget: { type: 'set', id: 'speciesId' },
      },
      {
        id: 'quickNpcBuild',
        label: 'Build',
        value: 'Level 1 Fighter',
        editTarget: { type: 'external', id: 'quickNpcBuild' },
      },
    ])
  })

  it('formats Build as level-only when class progression does not apply', () => {
    const elf = makeSpecies({ slug: 'elf', name: 'Elf' })
    const elfContext = createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        species: [elf, ...populatedBuilderCatalog.species],
      },
    })
    const rows = resolveQuickNpcSetupSummaryRows({
      createContext: memberCreateContext,
      values: quickNpcMemberSetupWithNoTitle({
        speciesId: elf.id,
        classId: populatedBuilderCatalog.classes[0]!.id,
        level: 0,
      }),
      context: elfContext,
      titles: [],
    })

    expect(rows[2]).toEqual({
      id: 'quickNpcBuild',
      label: 'Build',
      value: 'Level 0',
      editTarget: { type: 'external', id: 'quickNpcBuild' },
    })
  })
})

describe('isQuickNpcBuildResolved', () => {
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
      isQuickNpcBuildResolved({
        context,
        values: quickNpcMemberSetupWithNoTitle({
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: '',
          level: 1,
        }),
      }),
    ).toBe(false)
  })

  it('is resolved at Level 0 without class for standalone context', () => {
    expect(
      isQuickNpcBuildResolved({
        context,
        values: quickNpcStandaloneSetupValues({
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: '',
          level: 0,
        }),
      }),
    ).toBe(true)
  })

  it('is resolved when a single recommendation has been auto-seeded', () => {
    expect(
      isQuickNpcBuildResolved({
        context: multiClassContext,
        values: quickNpcMemberSetupValues({
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: 'Guildmaster',
          classId: rogueClass.id,
          level: 5,
        }),
      }),
    ).toBe(true)
  })
})

describe('quickNpcBuildRevision', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })
  const memberBaseValues = quickNpcMemberSetupValues({
    speciesId: 'srd-cc-5.2.1:dwarf',
    membershipTitle: 'Guildmaster',
    classId: populatedBuilderCatalog.classes[0]!.id,
    level: 5,
  })
  const standaloneBaseValues = quickNpcStandaloneSetupValues({
    speciesId: 'srd-cc-5.2.1:dwarf',
    classId: populatedBuilderCatalog.classes[0]!.id,
    level: 5,
  })

  it('derives member revision from membershipTitle, speciesId, level, and classId', () => {
    expect(quickNpcBuildRevision(memberBaseValues)).toBe(
      `Guildmaster:srd-cc-5.2.1:dwarf:5:${populatedBuilderCatalog.classes[0]!.id}`,
    )
    expect(quickNpcBuildRevision({ ...memberBaseValues, membershipTitle: 'Other' })).not.toBe(
      quickNpcBuildRevision(memberBaseValues),
    )
  })

  it('derives standalone revision from speciesId, level, and classId only', () => {
    expect(quickNpcBuildRevision(standaloneBaseValues)).toBe(
      `srd-cc-5.2.1:dwarf:5:${populatedBuilderCatalog.classes[0]!.id}`,
    )
    expect(quickNpcBuildRevision(standaloneBaseValues)).not.toContain('Guildmaster')
    expect(quickNpcBuildRevision({ ...standaloneBaseValues, level: 3 })).not.toBe(
      quickNpcBuildRevision(standaloneBaseValues),
    )
  })

  it('registers Build as an explicit external decision with Continue label', () => {
    const decision = resolveQuickNpcBuildExternalDecision({
      values: memberBaseValues,
      context,
    })

    expect(decision).toEqual({
      id: QUICK_NPC_BUILD_EXTERNAL_DECISION_ID,
      isResolved: true,
      completion: 'explicit',
      revision: quickNpcBuildRevision(memberBaseValues),
      completeLabel: 'Continue',
    })
  })

  it('changes revision when build-affecting inputs change', () => {
    const first = resolveQuickNpcBuildExternalDecision({ values: memberBaseValues, context })
    const second = resolveQuickNpcBuildExternalDecision({
      values: { ...memberBaseValues, level: 2 },
      context,
    })

    expect(first.revision).not.toBe(second.revision)
  })
})
